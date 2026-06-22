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

/** Runs a dedicated Claude analytics pass and upserts MeetingAnalytics. */
export async function generateAnalytics(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
  if (!meeting?.rawTranscript) throw new Error("No transcript to analyze");

  const raw = await claudeText({
    prompt: analyticsPrompt(meeting.rawTranscript, meeting.duration ?? 0),
    maxTokens: 3000,
    temperature: 0.2,
  });
  const a = parseJson<AnalyticsResult>(raw);
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
