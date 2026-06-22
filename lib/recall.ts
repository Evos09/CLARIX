import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { TranscriptSegment } from "@/lib/transcription";
import { processMeeting } from "@/lib/processing";
import { isClaudeConfigured } from "@/lib/claude";

const BASE = process.env.RECALL_API_BASE ?? "https://us-east-1.recall.ai/api/v1";

export function isRecallConfigured(): boolean {
  return Boolean(process.env.RECALL_API_KEY);
}

function headers() {
  return { Authorization: `Token ${process.env.RECALL_API_KEY}`, "Content-Type": "application/json" };
}

export function detectPlatform(url: string): string {
  if (url.includes("zoom.us")) return "ZOOM";
  if (url.includes("meet.google")) return "GOOGLE_MEET";
  if (url.includes("teams.microsoft") || url.includes("teams.live")) return "TEAMS";
  if (url.includes("webex.com")) return "WEBEX";
  return "UNKNOWN";
}

export async function createBot(meetingUrl: string, title: string): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/bot`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: "CLARIX",
      recording_mode: "speaker_view",
      transcription_options: { provider: "assembly_ai" },
      automatic_leave: { silence_detection: { timeout: 300 } },
      metadata: { title },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? data.message ?? "Recall bot create failed");
  return { id: data.id };
}

export async function getBot(botId: string): Promise<{ status_changes?: { code: string }[]; status?: { code: string } }> {
  const res = await fetch(`${BASE}/bot/${botId}`, { headers: headers() });
  if (!res.ok) throw new Error("Recall bot fetch failed");
  return res.json();
}

export async function leaveBot(botId: string): Promise<void> {
  await fetch(`${BASE}/bot/${botId}/leave_call`, { method: "POST", headers: headers() }).catch(() => {});
}

interface RecallTranscriptEntry {
  speaker?: string;
  words?: { text: string; start_timestamp?: number; end_timestamp?: number }[];
}

/** Pulls the Recall transcript, stores it on the meeting, and kicks off Claude processing. */
export async function ingestBotTranscript(meetingId: string, botId: string): Promise<void> {
  const res = await fetch(`${BASE}/bot/${botId}/transcript`, { headers: headers() });
  if (!res.ok) return;
  const entries = (await res.json()) as RecallTranscriptEntry[];

  const segments: TranscriptSegment[] = entries.map((e) => {
    const words = e.words ?? [];
    return {
      speaker: e.speaker ?? "?",
      text: words.map((w) => w.text).join(" "),
      start: Math.round(words[0]?.start_timestamp ?? 0),
      end: Math.round(words[words.length - 1]?.end_timestamp ?? 0),
    };
  });
  const speakers = new Set(segments.map((s) => s.speaker));
  const rawTranscript = segments.map((s) => `Speaker ${s.speaker}: ${s.text}`).join("\n");

  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      rawTranscript,
      transcriptSegments: segments as unknown as Prisma.InputJsonValue,
      speakerCount: speakers.size || undefined,
      status: isClaudeConfigured() ? "PROCESSING" : "COMPLETE",
    },
  });
  if (isClaudeConfigured() && rawTranscript) {
    processMeeting(meetingId).catch(() => {});
  }
}
