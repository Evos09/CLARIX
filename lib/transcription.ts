import type { Transcript } from "assemblyai";
import { Prisma } from "@prisma/client";
import { getAssemblyAI } from "@/lib/assemblyai";
import { getSupabaseAdmin, AUDIO_BUCKET } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { isClaudeConfigured } from "@/lib/claude";
import { detectMeetingType } from "@/lib/detect";
import { processMeeting } from "@/lib/processing";

export interface TranscriptSegment {
  speaker: string;
  text: string;
  start: number; // seconds
  end: number; // seconds
}

const MEDICAL_WORD_BOOST = [
  "hypertension", "diabetes", "myocardial", "infarction", "ibuprofen",
  "amoxicillin", "metformin", "lisinopril", "diagnosis", "prognosis",
  "milligrams", "dosage", "symptoms", "prescription", "allergy",
];

/** Generates a short-lived signed URL AssemblyAI can fetch the audio from. */
export async function getAudioSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(AUDIO_BUCKET)
    .createSignedUrl(storagePath, 60 * 60 * 2); // 2 hours
  if (error || !data) throw new Error(`Could not sign audio URL: ${error?.message}`);
  return data.signedUrl;
}

/** Submits a transcription job to AssemblyAI and marks the meeting TRANSCRIBING. */
export async function startTranscription(meetingId: string): Promise<string> {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting) throw new Error("Meeting not found");
  if (!meeting.storagePath) throw new Error("Meeting has no uploaded audio");

  const audioUrl = await getAudioSignedUrl(meeting.storagePath);
  const isMedical =
    meeting.meetingType === "MEDICAL_APPOINTMENT" || meeting.detectedType === "MEDICAL_APPOINTMENT";

  const secret = process.env.ASSEMBLYAI_WEBHOOK_SECRET;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const transcript = await getAssemblyAI().transcripts.submit({
    audio_url: audioUrl,
    speaker_labels: true,
    language_detection: true,
    punctuate: true,
    format_text: true,
    ...(isMedical ? { word_boost: MEDICAL_WORD_BOOST, boost_param: "high" as const } : {}),
    webhook_url: `${base}/api/webhooks/assemblyai`,
    ...(secret
      ? { webhook_auth_header_name: "x-clarix-webhook", webhook_auth_header_value: secret }
      : {}),
  });

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { transcriptJobId: transcript.id, status: "TRANSCRIBING" },
  });
  return transcript.id;
}

function toSegments(t: Transcript): TranscriptSegment[] {
  if (!t.utterances) return [];
  return t.utterances.map((u) => ({
    speaker: u.speaker ?? "?",
    text: u.text,
    start: Math.round((u.start ?? 0) / 1000),
    end: Math.round((u.end ?? 0) / 1000),
  }));
}

function toPlainText(t: Transcript, segments: TranscriptSegment[]): string {
  if (segments.length) {
    return segments.map((s) => `Speaker ${s.speaker}: ${s.text}`).join("\n");
  }
  return t.text ?? "";
}

/**
 * Stores a completed AssemblyAI transcript on the meeting and, when the meeting
 * was created with auto-detect, classifies the meeting type via Claude.
 * Phase 2/3 end at COMPLETE; Phase 4 inserts a PROCESSING (Claude) step before it.
 */
export async function ingestTranscript(meetingId: string, t: Transcript): Promise<void> {
  if (t.status === "error") {
    // Keep the provider's wording. It is usually the only thing that tells the
    // user what to do differently — "no spoken audio" means check the mic, and
    // that is not something we could infer from a bare status.
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "ERROR", errorMessage: t.error ?? "Transcription failed." },
    });
    return;
  }
  const segments = toSegments(t);
  const speakers = new Set(segments.map((s) => s.speaker));
  const rawTranscript = toPlainText(t, segments);

  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      rawTranscript,
      transcriptSegments: segments as unknown as Prisma.InputJsonValue,
      duration: t.audio_duration ?? undefined,
      speakerCount: speakers.size || undefined,
      language: t.language_code ?? undefined,
      status: "COMPLETE",
      // A retry that succeeds must not leave the old failure on screen.
      errorMessage: null,
    },
  });

  // Auto-detect meeting type (best-effort; never blocks completion).
  if (meeting.autoDetect && isClaudeConfigured() && rawTranscript) {
    try {
      const detection = await detectMeetingType(rawTranscript);
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { detectedType: detection.type, meetingType: detection.type },
      });
    } catch {
      // detection failure leaves the meeting as GENERAL
    }
  }

  // Run AI processing (PROCESSING -> COMPLETE). Best-effort; transcript stays on failure.
  if (isClaudeConfigured() && rawTranscript) {
    try {
      await processMeeting(meetingId);
    } catch {
      // leave the meeting COMPLETE with transcript only
    }
  }
}

/**
 * Poll fallback for environments where the webhook can't reach the server
 * (e.g. localhost). Called from GET /api/meetings/[id] while TRANSCRIBING.
 */
export async function syncTranscriptStatus(meetingId: string): Promise<void> {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting?.transcriptJobId || meeting.status !== "TRANSCRIBING") return;
  const t = await getAssemblyAI().transcripts.get(meeting.transcriptJobId);
  if (t.status === "completed" || t.status === "error") {
    await ingestTranscript(meetingId, t);
  }
}
