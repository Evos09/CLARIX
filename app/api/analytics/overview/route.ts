import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { getMeetingType } from "@/lib/meetingTypes";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const rows = await prisma.meetingAnalytics.findMany({
    where: { meeting: { orgId: ctx.orgId } },
    include: { meeting: { select: { title: true, meetingType: true, createdAt: true, duration: true } } },
    orderBy: { generatedAt: "desc" },
    take: 200,
  });

  const n = rows.length;
  const avg = (sel: (r: (typeof rows)[number]) => number) => (n ? rows.reduce((s, r) => s + sel(r), 0) / n : 0);

  const sentimentCounts: Record<string, number> = { POSITIVE: 0, NEUTRAL: 0, MIXED: 0, TENSE: 0 };
  for (const r of rows) {
    const s = r.overallSentiment || "NEUTRAL";
    sentimentCounts[s] = (sentimentCounts[s] ?? 0) + 1;
  }

  const typeCounts: Record<string, number> = {};
  for (const r of rows) {
    const label = getMeetingType(r.meeting.meetingType).label;
    typeCounts[label] = (typeCounts[label] ?? 0) + 1;
  }

  const trend = rows
    .slice(0, 30)
    .reverse()
    .map((r) => ({ date: r.meeting.createdAt.toISOString().slice(5, 10), engagement: Math.round(r.overallEngagement) }));

  // Aggregate top filler words
  const fillerWordRollup: Record<string, number> = {};
  for (const r of rows) {
    if (r.fillerWordDetails && typeof r.fillerWordDetails === "object") {
      for (const [word, count] of Object.entries(r.fillerWordDetails)) {
        if (typeof count === "number") {
          fillerWordRollup[word] = (fillerWordRollup[word] ?? 0) + count;
        }
      }
    }
  }
  const topFillerWords = Object.entries(fillerWordRollup)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Extract recent analytics records
  const recentAnalytics = rows.slice(0, 6).map((r) => ({
    meetingId: r.meetingId,
    title: r.meeting.title,
    date: r.meeting.createdAt.toISOString().slice(5, 10),
    engagement: Math.round(r.overallEngagement),
    participation: Math.round(r.participationBalance),
    sentiment: r.overallSentiment,
  }));

  // Calculate total minutes analyzed
  const totalDurationSeconds = rows.reduce((s, r) => s + (r.meeting.duration ?? 0), 0);
  const totalMinutes = Math.round(totalDurationSeconds / 60);

  return NextResponse.json({
    meetingCount: n,
    avgEngagement: Math.round(avg((r) => r.overallEngagement)),
    avgParticipation: Math.round(avg((r) => r.participationBalance)),
    totalFillerWords: rows.reduce((s, r) => s + r.fillerWordCount, 0),
    avgQuestionRate: Math.round(avg((r) => r.questionRate)),
    avgDecisionRate: Math.round(avg((r) => r.decisionRate)),
    avgActionRate: Math.round(avg((r) => r.actionRate)),
    totalMinutes,
    sentimentCounts,
    typeBreakdown: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
    engagementTrend: trend,
    topFillerWords,
    recentAnalytics,
  });
}
