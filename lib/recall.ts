import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { TranscriptSegment } from "@/lib/transcription";
import { processMeeting } from "@/lib/processing";
import { isClaudeConfigured } from "@/lib/claude";

const BASE = "https://api.meetingbaas.com/v2";

export function isRecallConfigured(): boolean {
  return Boolean(process.env.MEETING_BAAS_API_KEY ?? process.env.RECALL_API_KEY);
}

function headers() {
  const key = process.env.MEETING_BAAS_API_KEY ?? process.env.RECALL_API_KEY ?? "";
  return {
    "x-meeting-baas-api-key": key,
    "Content-Type": "application/json",
  };
}

export function detectPlatform(url: string): string {
  if (url.includes("zoom.us")) return "ZOOM";
  if (url.includes("meet.google")) return "GOOGLE_MEET";
  if (url.includes("teams.microsoft") || url.includes("teams.live")) return "TEAMS";
  if (url.includes("webex.com")) return "WEBEX";
  return "UNKNOWN";
}

export async function createBot(meetingUrl: string, title: string, orgId?: string): Promise<{ id: string }> {
  let vocabulary: string[] = [];
  if (orgId) {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { customVocabulary: true },
    });
    vocabulary = org?.customVocabulary ?? [];
  }

  const res = await fetch(`${BASE}/bots`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: "CLARIX",
      recording_mode: "speaker_view",
      transcription_enabled: true,
      transcription_config: { 
        provider: "gladia",
        ...(vocabulary.length > 0 ? {
          custom_vocabulary: true,
          custom_vocabulary_config: { vocabulary }
        } : {})
      },
      extra: { title },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "MeetingBaas bot create failed");
  const botId = data.data?.bot_id;
  if (!botId) throw new Error("No bot_id returned from MeetingBaas");
  return { id: botId };
}

export async function getBot(botId: string): Promise<{ status_changes?: { code: string }[]; status?: { code: string } }> {
  const res = await fetch(`${BASE}/bots/${botId}`, { headers: headers() });
  if (!res.ok) throw new Error("MeetingBaas bot fetch failed");
  const data = await res.json();
  const status = data.data?.status;
  return {
    status: {
      code: status,
    },
  };
}

export async function leaveBot(botId: string): Promise<void> {
  await fetch(`${BASE}/bots/${botId}`, { method: "DELETE", headers: headers() }).catch(() => {});
}

interface BaasTranscriptSegment {
  speaker?: string;
  start?: number;
  end?: number;
  text?: string;
}

interface BaasTranscriptResponse {
  segments?: BaasTranscriptSegment[];
  result?: {
    utterances?: BaasTranscriptSegment[];
  };
}

/** Pulls the MeetingBaas transcript, stores it on the meeting, and kicks off Claude processing. */
export async function ingestBotTranscript(meetingId: string, botId: string): Promise<void> {
  const res = await fetch(`${BASE}/bots/${botId}`, { headers: headers() });
  if (!res.ok) return;
  const botData = await res.json();
  const transcriptUrl = botData.data?.transcription;
  if (!transcriptUrl) return;

  const transcriptRes = await fetch(transcriptUrl);
  if (!transcriptRes.ok) return;
  const transcriptData = (await transcriptRes.json()) as BaasTranscriptResponse;

  const utterances = transcriptData.result?.utterances ?? transcriptData.segments ?? [];
  const segments: TranscriptSegment[] = utterances.map((s) => ({
    speaker: s.speaker ?? "?",
    text: s.text ?? "",
    start: Math.round(s.start ?? 0),
    end: Math.round(s.end ?? 0),
  }));

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
