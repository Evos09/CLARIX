import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { claudeText, parseJson, isClaudeConfigured } from "@/lib/claude";
import { getMeetingType } from "@/lib/meetingTypes";
import { getPromptSpec } from "@/lib/prompts";
import { buildProcessingPrompt, BASE_SYSTEM } from "@/lib/prompts/base";
import type { BaseOutput } from "@/lib/outputTypes";
import { sendMeetingComplete } from "@/lib/email";
import { extractKeyPoints } from "@/lib/keyPoints";

/**
 * Runs Claude analysis for a meeting: picks the prompt by type, calls Claude,
 * parses the JSON, and stores it. Sets status PROCESSING then COMPLETE.
 */
export async function processMeeting(meetingId: string, instruction?: string): Promise<BaseOutput> {
  if (!isClaudeConfigured()) throw new Error("ANTHROPIC_API_KEY is not set");
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
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
    const raw = await claudeText({ system: BASE_SYSTEM, prompt, maxTokens: 4096, temperature: 0.2 });
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
    // Transcript remains available; leave the meeting COMPLETE so it isn't stuck.
    await prisma.meeting.update({ where: { id: meetingId }, data: { status: "COMPLETE" } });
    throw err;
  }
}
