import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { claudeText, parseJson, isClaudeConfigured, CLAUDE_HAIKU } from "@/lib/claude";
import { getMeetingType } from "@/lib/meetingTypes";
import { getPromptSpec } from "@/lib/prompts";
import { buildProcessingPrompt, BASE_SYSTEM } from "@/lib/prompts/base";
import type { BaseOutput } from "@/lib/outputTypes";
import { sendMeetingComplete } from "@/lib/email";
import { extractKeyPoints } from "@/lib/keyPoints";
import { captureServer } from "@/lib/tracking-server";

/**
 * Runs Claude analysis for a meeting: picks the prompt by type, calls Claude,
 * parses the JSON, and stores it. Sets status PROCESSING then COMPLETE.
 */
export async function processMeeting(meetingId: string, instruction?: string): Promise<BaseOutput> {
  if (!isClaudeConfigured()) throw new Error("ANTHROPIC_API_KEY is not set");
  const meeting = await prisma.meeting.findUnique({ 
    where: { id: meetingId },
    include: { org: { select: { plan: true } } }
  });
  if (!meeting) throw new Error("Meeting not found");
  if (!meeting.rawTranscript) throw new Error("No transcript to process");

  await prisma.meeting.update({ where: { id: meetingId }, data: { status: "PROCESSING" } });

  const typeId = meeting.meetingType;
  const typeCfg = getMeetingType(typeId);
  const spec = getPromptSpec(typeId);
  const template = await prisma.outputTemplate.findFirst({
    where: { orgId: meeting.orgId, meetingType: typeId },
  });

  const prompt = buildProcessingPrompt({
    typeLabel: typeCfg.label,
    spec,
    transcript: meeting.rawTranscript,
    instruction,
    templateOverride: template?.promptOverride,
  });

  try {
    const plan = meeting.org?.plan ?? "FREE";
    // Meeting analysis runs on Haiku for all plans to keep per-meeting cost low;
    // Sonnet is reserved for Pro+ Clarix Chat. (`plan` is still used for analytics below.)
    const model = CLAUDE_HAIKU;

    const raw = await claudeText({ system: BASE_SYSTEM, prompt, maxTokens: 4096, temperature: 0.2, model });
    const output = parseJson<BaseOutput>(raw);
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { structuredOutput: output as unknown as Prisma.InputJsonValue, status: "COMPLETE" },
    });

    // Sync extracted action items into the queryable ActionItem table.
    const items = Array.isArray(output.actionItems) ? output.actionItems : [];
    await prisma.actionItem.deleteMany({ where: { meetingId } });
    const rows = items
      .filter((it) => it && typeof it.task === "string" && it.task.trim())
      .map((it) => ({
        task: it.task,
        owner: it.owner || null,
        dueDate: it.dueDate || null,
        priority: it.priority || null,
        meetingId,
        orgId: meeting.orgId,
      }));
    if (rows.length) await prisma.actionItem.createMany({ data: rows });

    await extractKeyPoints(meetingId, meeting.rawTranscript);

    // Funnel analytics (no PII — type/plan only). "first" = org's 1st complete.
    const completeCount = await prisma.meeting.count({ where: { orgId: meeting.orgId, status: "COMPLETE" } });
    captureServer("meeting_processed", meeting.userId, { meetingType: typeId, plan });
    if (completeCount <= 1) captureServer("first_meeting_processed", meeting.userId, { plan });

    // Index the transcript for cross-meeting semantic search (best-effort;
    // no-op unless OPENAI_API_KEY is set).
    try {
      const { ingestMeeting } = await import("@/lib/memory/ingest");
      await ingestMeeting(meetingId);
    } catch (memErr) {
      console.error("Failed to index meeting for memory search:", memErr);
    }

    // Notify the owner their meeting is ready (best-effort).
    const owner = await prisma.user.findUnique({ where: { id: meeting.userId } });
    if (owner?.email) await sendMeetingComplete({ to: owner.email, title: meeting.title, meetingId });

    // Auto-post to Slack if configured
    try {
      const slackConn = await prisma.slackConnection.findUnique({
        where: { userId: meeting.userId },
      });
      if (slackConn && slackConn.connected && slackConn.autoPostEnabled && slackConn.autoPostChannelId) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const meetingUrl = `${appUrl}/meetings/${meetingId}`;
        const { pushToSlack } = await import("@/lib/push/slack");
        const { decryptToken } = await import("@/lib/crypto");
        await pushToSlack(
          decryptToken(slackConn.accessToken),
          slackConn.autoPostChannelId,
          meeting.title,
          meetingUrl,
          output
        );
      }
    } catch (slackErr) {
      console.error("Failed to auto-post to Slack:", slackErr);
    }

    return output;
  } catch (err) {
    captureServer("meeting_processing_failed", meeting.userId, {
      reason: err instanceof Error ? err.name : "unknown",
    });
    // Transcript remains available; leave the meeting COMPLETE so it isn't stuck.
    await prisma.meeting.update({ where: { id: meetingId }, data: { status: "COMPLETE" } });
    throw err;
  }
}
