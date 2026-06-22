import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getMeetingType } from "@/lib/meetingTypes";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const rows = await prisma.meetingAnalytics.findMany({
    where: { meeting: { orgId: ctx.orgId } },
    include: { meeting: { select: { title: true, meetingType: true, createdAt: true } } },
    orderBy: { generatedAt: "desc" },
    take: 200,
  });

  const n = rows.length;
  const avg = (sel: (r: (typeof rows)[number]) => number) => (n ? rows.reduce((s, r) => s + sel(r), 0) / n : 0);

  const sentimentCounts: Record<string, number> = {};
  for (const r of rows) sentimentCounts[r.overallSentiment] = (sentimentCounts[r.overallSentiment] ?? 0) + 1;

  const typeCounts: Record<string, number> = {};
  for (const r of rows) {
    const label = getMeetingType(r.meeting.meetingType).label;
    typeCounts[label] = (typeCounts[label] ?? 0) + 1;
  }

  const trend = rows
    .slice(0, 30)
    .reverse()
    .map((r) => ({ date: r.meeting.createdAt.toISOString().slice(5, 10), engagement: Math.round(r.overallEngagement) }));

  return NextResponse.json({
    meetingCount: n,
    avgEngagement: Math.round(avg((r) => r.overallEngagement)),
    avgParticipation: Math.round(avg((r) => r.participationBalance)),
    totalFillerWords: rows.reduce((s, r) => s + r.fillerWordCount, 0),
    sentimentCounts,
    typeBreakdown: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
    engagementTrend: trend,
  });
}
