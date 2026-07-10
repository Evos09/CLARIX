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
      // Name + entry message make the recording unmissable to participants
      // (all-party-consent states require that presence be announced).
      bot_name: "CLARIX (Recording)",
      entry_message:
        "CLARIX is recording and transcribing this meeting. By continuing, participants consent to being recorded.",
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
  words?: { word?: string; text?: string; start?: number; end?: number }[];
}

interface BaasTranscriptResponse {
  segments?: BaasTranscriptSegment[];
  result?: {
    utterances?: BaasTranscriptSegment[];
  };
}

/** Normalizes MeetingBaas utterances (with or without per-word timing) and
 *  stores them on the meeting, then kicks off Claude processing. */
async function storeTranscript(meetingId: string, utterances: BaasTranscriptSegment[]): Promise<boolean> {
  const segments: TranscriptSegment[] = utterances.map((s) => {
    const words = s.words ?? [];
    const text = s.text ?? words.map((w) => w.word ?? w.text ?? "").join(" ").trim();
    return {
      speaker: s.speaker ?? "?",
      text,
      start: Math.round(s.start ?? words[0]?.start ?? 0),
      end: Math.round(s.end ?? words[words.length - 1]?.end ?? 0),
    };
  }).filter((s) => s.text);
  if (!segments.length) return false;

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
  return true;
}

/**
 * Ingests a transcript delivered inline in a MeetingBaas `complete` webhook —
 * the fastest path: the transcript is stored the moment the meeting ends, with
 * no extra round-trip back to the MeetingBaas API.
 */
export async function ingestTranscriptPayload(
  meetingId: string,
  utterances: unknown,
): Promise<boolean> {
  if (!Array.isArray(utterances) || utterances.length === 0) return false;
  try {
    return await storeTranscript(meetingId, utterances as BaasTranscriptSegment[]);
  } catch {
    return false;
  }
}

/** Pulls the MeetingBaas transcript, stores it on the meeting, and kicks off
 *  Claude processing. The transcript URL can lag the end-of-call webhook by a
 *  little, so retry a few times before giving up (the cron sweep is the final
 *  safety net). */
export async function ingestBotTranscript(meetingId: string, botId: string, attempts = 5): Promise<void> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 20_000));
    try {
      const res = await fetch(`${BASE}/bots/${botId}`, { headers: headers() });
      if (!res.ok) continue;
      const botData = await res.json();
      const transcriptUrl = botData.data?.transcription;
      if (!transcriptUrl) continue;

      const transcriptRes = await fetch(transcriptUrl);
      if (!transcriptRes.ok) continue;
      const transcriptData = (await transcriptRes.json()) as BaasTranscriptResponse;

      const utterances = transcriptData.result?.utterances ?? transcriptData.segments ?? [];
      if (await storeTranscript(meetingId, utterances)) return;
    } catch {
      // transient network failure — retry
    }
  }
}

/**
 * Safety net: re-ingest any bot whose call ended but whose meeting is still
 * stuck in TRANSCRIBING (missed webhook, transcript URL that lagged past the
 * retry window, or a deploy mid-callback). Called from the auto-join cron.
 */
export async function sweepStuckTranscripts(): Promise<number> {
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const stuck = await prisma.meetingBot.findMany({
    where: {
      status: "DONE",
      leftAt: { lte: twoMinAgo, gte: dayAgo },
      meeting: { status: "TRANSCRIBING" },
    },
    select: { meetingId: true, recallBotId: true },
    take: 10,
  });
  for (const bot of stuck) {
    // Single attempt per sweep — the cron re-runs regularly.
    await ingestBotTranscript(bot.meetingId, bot.recallBotId, 1).catch(() => {});
  }
  return stuck.length;
}
