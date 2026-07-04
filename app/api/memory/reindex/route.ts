import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestMeeting } from "@/lib/memory/ingest";
import { searchChunks } from "@/lib/memory/search";
import { isEmbeddingsConfigured } from "@/lib/embeddings";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}` || req.headers.get("x-cron-secret") === secret;
}

/**
 * Backfill: embed + index every COMPLETE meeting's transcript.
 * Optional ?orgId= to limit to one org. Auth: CRON_SECRET.
 */
export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isEmbeddingsConfigured()) {
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 503 });
  }

  const orgId = new URL(req.url).searchParams.get("orgId") ?? undefined;
  const meetings = await prisma.meeting.findMany({
    where: { status: "COMPLETE", rawTranscript: { not: null }, ...(orgId ? { orgId } : {}) },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  let indexed = 0;
  let chunks = 0;
  for (const m of meetings) {
    try {
      const n = await ingestMeeting(m.id);
      if (n > 0) {
        indexed++;
        chunks += n;
      }
    } catch (e) {
      console.error("reindex failed for meeting", m.id, e);
    }
  }

  return NextResponse.json({ meetings: meetings.length, indexed, chunks });
}

/**
 * Verify retrieval: ?q=<question>&orgId=<org> returns the top chunk matches.
 * Auth: CRON_SECRET. (Temporary harness — Phase 2 replaces this with a real
 * user-facing endpoint gated by plan.)
 */
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const orgId = url.searchParams.get("orgId");
  if (!q || !orgId) return NextResponse.json({ error: "q and orgId are required" }, { status: 400 });

  const hits = await searchChunks(orgId, q, 8);
  return NextResponse.json({
    hits: hits.map((h) => ({
      meetingId: h.meetingId,
      title: h.title,
      createdAt: h.createdAt,
      distance: Number(h.distance.toFixed(4)),
      preview: h.content.slice(0, 200),
    })),
  });
}
