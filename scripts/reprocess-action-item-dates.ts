/**
 * Backfill: re-run meeting analysis so action item due dates land in the right
 * year.
 *
 * The analysis prompt never told the model when the meeting happened, so
 * "Sept 13" and "the 19th" were dated from its training prior — every dated
 * action item in the workspace came back in 2024, i.e. permanently overdue.
 * lib/prompts/base.ts now anchors relative dates to meeting.createdAt; this
 * re-runs the meetings that were analysed before that fix.
 *
 * Deliberately NOT lib/processing.ts's processMeeting(). That function also
 * emails the owner "your meeting is ready", re-posts to Slack, and re-fires
 * funnel analytics — running it across the whole library would send a burst of
 * notifications for meetings processed weeks ago. This does the two things the
 * backfill actually needs (structuredOutput + ActionItem rows) using the very
 * same prompt builder and model call, and nothing else.
 *
 *   npx tsx scripts/reprocess-action-item-dates.ts            # dry run
 *   npx tsx scripts/reprocess-action-item-dates.ts --apply    # write
 *   npx tsx scripts/reprocess-action-item-dates.ts --apply --only <meetingId>
 */
import { prisma } from "@/lib/prisma";
import { claudeText, parseJson, CLAUDE_HAIKU } from "@/lib/claude";
import { buildProcessingPrompt, BASE_SYSTEM } from "@/lib/prompts/base";
import { getPromptSpec } from "@/lib/prompts";
import { getMeetingType } from "@/lib/meetingTypes";
import type { BaseOutput } from "@/lib/outputTypes";
import type { Prisma } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;

/** Dates the model should never produce: before the meeting, or wildly after. */
function suspect(due: string | null | undefined, meetingDate: Date): boolean {
  if (!due) return false;
  const d = new Date(due);
  if (Number.isNaN(d.getTime())) return true;
  const day = 86_400_000;
  return d.getTime() < meetingDate.getTime() - day || d.getTime() > meetingDate.getTime() + 400 * day;
}

(async () => {
  const top = (
    await prisma.meeting.groupBy({
      by: ["orgId"],
      _count: { _all: true },
      orderBy: { _count: { orgId: "desc" } },
      take: 1,
    })
  )[0];

  const meetings = await prisma.meeting.findMany({
    where: { orgId: top.orgId, status: "COMPLETE", ...(ONLY ? { id: ONLY } : {}) },
    orderBy: { createdAt: "asc" },
  });

  const runnable = meetings.filter((m) => m.rawTranscript && m.rawTranscript.trim());
  console.log(
    `${APPLY ? "APPLY" : "DRY RUN"} — ${runnable.length} of ${meetings.length} COMPLETE meetings have a transcript\n`,
  );

  let fixed = 0;
  let failed = 0;

  for (const m of runnable) {
    const date = m.createdAt.toISOString().slice(0, 10);
    const before = await prisma.actionItem.findMany({
      where: { meetingId: m.id },
      select: { task: true, dueDate: true },
    });
    const badBefore = before.filter((a) => suspect(a.dueDate, m.createdAt)).length;

    const typeCfg = getMeetingType(m.meetingType);
    const template = await prisma.outputTemplate.findFirst({
      where: { orgId: m.orgId, meetingType: m.meetingType },
    });

    const prompt = buildProcessingPrompt({
      typeLabel: typeCfg.label,
      spec: getPromptSpec(m.meetingType),
      transcript: m.rawTranscript!,
      templateOverride: template?.promptOverride,
      meetingDate: m.createdAt,
    });

    let output: BaseOutput;
    try {
      const raw = await claudeText({
        system: BASE_SYSTEM,
        prompt,
        maxTokens: 4096,
        temperature: 0.2,
        model: CLAUDE_HAIKU,
      });
      output = parseJson<BaseOutput>(raw);
    } catch (e) {
      console.log(`  FAIL  ${date}  ${JSON.stringify(m.title).slice(0, 34)}  ${(e as Error).message.slice(0, 70)}`);
      failed++;
      continue;
    }

    const items = Array.isArray(output.actionItems) ? output.actionItems : [];
    const badAfter = items.filter((it) => suspect(it.dueDate, m.createdAt)).length;
    const dated = items.filter((it) => it.dueDate).map((it) => it.dueDate);

    console.log(
      `  ${APPLY ? "WROTE" : "would"}  ${date}  ${JSON.stringify(m.title).slice(0, 34).padEnd(36)}` +
        `items ${String(before.length).padStart(2)}→${String(items.length).padStart(2)}  ` +
        `bad ${badBefore}→${badAfter}  ${dated.slice(0, 4).join(" ")}`,
    );

    if (badAfter > 0) {
      const bad = items.filter((it) => suspect(it.dueDate, m.createdAt)).map((it) => it.dueDate);
      console.log(`         ^ still out of range: ${bad.join(" ")}`);
    }

    if (APPLY) {
      await prisma.meeting.update({
        where: { id: m.id },
        data: { structuredOutput: output as unknown as Prisma.InputJsonValue },
      });
      // Same sync lib/processing.ts performs. Nothing in this workspace is
      // marked complete, so rebuilding the rows loses no state; if that ever
      // changes, carry `completed` across by task text before deleting.
      await prisma.actionItem.deleteMany({ where: { meetingId: m.id } });
      const rows = items
        .filter((it) => it && typeof it.task === "string" && it.task.trim())
        .map((it) => ({
          task: it.task,
          owner: it.owner || null,
          dueDate: it.dueDate || null,
          priority: it.priority || null,
          meetingId: m.id,
          orgId: m.orgId,
        }));
      if (rows.length) await prisma.actionItem.createMany({ data: rows });
    }
    fixed++;
  }

  console.log(`\n${APPLY ? "reprocessed" : "would reprocess"}: ${fixed}   failed: ${failed}`);
  await prisma.$disconnect();
  process.exit(0);
})().catch(async (e) => {
  console.log("ERROR:", String((e as Error).message).slice(0, 300));
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
