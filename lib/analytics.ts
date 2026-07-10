import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { claudeText, parseJson } from "@/lib/claude";
import { analyticsPrompt } from "@/lib/prompts/analytics";

interface FillerDetail { word: string; count: number; speaker?: string }
interface AnalyticsResult {
  overallEngagement: number;
  participationBalance: number;
  questionRate: number;
  decisionRate: number;
  actionRate: number;
  overallSentiment: string;
  sentimentByMinute: unknown[];
  speakerStats: unknown[];
  fillerWordDetails: FillerDetail[];
  topicTimeline: unknown[];
  energyTimeline: unknown[];
  insights?: string[];
  recommendations?: string[];
}

const J = (v: unknown) => (v ?? []) as Prisma.InputJsonValue;
const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);

/**
 * Parse the model's analytics JSON, salvaging truncated output. If the
 * response hit the token cap mid-object, trim the partial tail and close any
 * open brackets/strings so the complete prefix still parses.
 */
function parseAnalyticsJson(raw: string): AnalyticsResult {
  try {
    return parseJson<AnalyticsResult>(raw);
  } catch {
    let text = raw.trim();
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/i);
    if (fence) text = fence[1].trim();
    const start = text.indexOf("{");
    if (start === -1) throw new Error("Analytics response was not JSON");
    text = text.slice(start);
    for (let end = text.length; end > 1; ) {
      const attempt = closeBrackets(text.slice(0, end));
      if (attempt) {
        try {
          return JSON.parse(attempt) as AnalyticsResult;
        } catch {
          /* keep trimming */
        }
      }
      // Drop the trailing partial value and retry from the previous separator.
      const prev = Math.max(
        text.lastIndexOf(",", end - 2),
        text.lastIndexOf("{", end - 2),
        text.lastIndexOf("[", end - 2),
      );
      if (prev <= 0) break;
      end = prev;
    }
    throw new Error("Analytics response was truncated and could not be repaired");
  }
}

/** Close any unterminated string and open braces/brackets in a JSON prefix. */
function closeBrackets(prefix: string): string | null {
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  for (const ch of prefix) {
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") {
      if (stack.pop() !== ch) return null; // mismatched — not salvageable here
    }
  }
  let s = prefix;
  if (inStr) s += '"';
  while (stack.length) s += stack.pop();
  return s;
}

/** Runs a dedicated Claude analytics pass and upserts MeetingAnalytics. */
export async function generateAnalytics(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting?.rawTranscript) throw new Error("No transcript to analyze");

  const raw = await claudeText({
    prompt: analyticsPrompt(meeting.rawTranscript, meeting.duration ?? 0),
    // 3000 was too tight — long meetings produced JSON that got cut off at the
    // cap and failed to parse ("Expected ',' or '}' … at position 7112").
    maxTokens: 8000,
    temperature: 0.2,
  });
  const a = parseAnalyticsJson(raw);
  const fillerWordCount = (a.fillerWordDetails ?? []).reduce((s, f) => s + num(f.count), 0);

  const data = {
    overallEngagement: num(a.overallEngagement),
    participationBalance: num(a.participationBalance),
    questionRate: num(a.questionRate),
    decisionRate: num(a.decisionRate),
    actionRate: num(a.actionRate),
    overallSentiment: a.overallSentiment ?? "NEUTRAL",
    sentimentByMinute: J(a.sentimentByMinute),
    speakerStats: J(a.speakerStats),
    fillerWordCount,
    fillerWordDetails: J(a.fillerWordDetails),
    topicTimeline: J(a.topicTimeline),
    energyTimeline: J(a.energyTimeline),
    insights: J(a.insights),
    recommendations: J(a.recommendations),
  };

  return prisma.meetingAnalytics.upsert({
    where: { meetingId },
    update: { ...data, generatedAt: new Date() },
    create: { meetingId, ...data },
  });
}
