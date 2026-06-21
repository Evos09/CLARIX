import { Prisma } from "@prisma/client";
import { claudeText, parseJson } from "@/lib/claude";
import { prisma } from "@/lib/prisma";

export interface KeyPoint {
  time: number;
  speaker: string;
  description: string;
  category: string;
}

export const KP_CATEGORY_CLASS: Record<string, string> = {
  DECISION: "bg-slate-200 text-slate-800 ring-slate-600/20",
  ACTION: "bg-teal-100 text-teal-700 ring-teal-600/20",
  QUESTION: "bg-purple-100 text-purple-700 ring-purple-600/20",
  INSIGHT: "bg-amber-100 text-amber-800 ring-amber-600/20",
  COMMITMENT: "bg-green-100 text-green-700 ring-green-600/20",
  CONCERN: "bg-red-100 text-red-700 ring-red-600/20",
  ANNOUNCEMENT: "bg-blue-100 text-blue-700 ring-blue-600/20",
};

const KP_SYSTEM = `You are a meeting analyst. From the meeting transcript, extract the 10 most important moments: key decisions, surprising statements, important commitments, questions raised, or turning points. For each, identify the approximate timestamp (in seconds from the start), the speaker label, a 1-sentence description, and a category from: DECISION, ACTION, QUESTION, INSIGHT, COMMITMENT, CONCERN, ANNOUNCEMENT.
Return ONLY JSON: { "keyPoints": [{ "time": number, "speaker": string, "description": string, "category": string }] }`;

/** Best-effort second Claude call to extract timestamped key points. Never throws. */
export async function extractKeyPoints(meetingId: string, transcript: string): Promise<void> {
  try {
    const raw = await claudeText({
      system: KP_SYSTEM,
      prompt: `Transcript:\n"""\n${transcript.slice(0, 14000)}\n"""`,
      maxTokens: 1500,
      temperature: 0.2,
    });
    const parsed = parseJson<{ keyPoints: KeyPoint[] }>(raw);
    const points = Array.isArray(parsed.keyPoints) ? parsed.keyPoints.slice(0, 12) : [];
    await prisma.meeting.update({ where: { id: meetingId }, data: { keyPoints: points as unknown as Prisma.InputJsonValue } });
  } catch {
    // best-effort; key points are optional
  }
}
