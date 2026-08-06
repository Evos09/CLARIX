import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateContext } from "@/lib/auth";
import { getMeetingType } from "@/lib/meetingTypes";
import { getOrgPlan, liveSurfacingAllowed } from "@/lib/plan";
import { searchChunks } from "@/lib/memory/search";
import { isEmbeddingsConfigured } from "@/lib/embeddings";

export const dynamic = "force-dynamic";

const Body = z.object({
  // The rolling live transcript. We only use its tail as the query, so a cap
  // here just bounds the payload.
  transcript: z.string().min(1).max(20000),
});

// Only surface a past-meeting snippet when it's genuinely close to what's being
// said right now. Cosine distance from text-embedding-3-small: ~0.3 is a strong
// match, ~0.5 is loosely related; above this it's noise we'd rather stay silent
// about than interrupt the meeting with.
const MAX_DISTANCE = 0.5;

/**
 * Live surfacing (overlay Phase 3). During a meeting the client posts its
 * rolling transcript here every ~30s; we embed the most recent slice and pull
 * the closest chunks from PAST meetings so relevant prior context appears
 * automatically — no typing, no question asked.
 *
 * Deliberately lightweight vs. /api/memory/ask: pure retrieval, NO Claude call
 * and NO chat-quota bump. This fires on a timer in the background, so metering
 * it would silently drain the user's Clarix Chat allowance.
 *
 * Access stays paid-only. The typed ask is free-capped (10/month) because the
 * user chooses to spend it; this one fires continuously on its own, so an
 * unmetered Free tier would be an open-ended embedding bill. Free gets an empty
 * snippet list rather than an error.
 *
 * Requires the semantic index — a keyword match on a transcript tail is too
 * noisy to auto-surface, so when embeddings aren't live we return no snippets.
 */
export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ snippets: [] });

  // No index yet → stay silent rather than surface near-random keyword hits.
  if (!isEmbeddingsConfigured()) return NextResponse.json({ snippets: [] });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Ambient surfacing is paid-only; the deliberate ask is free-capped.
  const plan = await getOrgPlan(ctx.orgId);
  if (!liveSurfacingAllowed(plan)) return NextResponse.json({ snippets: [], locked: true });

  // Use the tail of the transcript as the query — that's what's being discussed
  // "now". Older context already had its chance to surface on earlier polls.
  const tail = parsed.data.transcript.trim().slice(-700);

  try {
    const hits = await searchChunks(ctx.orgId, tail, 8);

    const seen = new Set<string>();
    const snippets = hits
      .filter((h) => h.distance <= MAX_DISTANCE)
      .filter((h) => {
        if (seen.has(h.meetingId)) return false; // one snippet per source meeting
        seen.add(h.meetingId);
        return true;
      })
      .slice(0, 3)
      .map((h) => ({
        meetingId: h.meetingId,
        title: h.title,
        type: getMeetingType(h.meetingType).label,
        date: h.createdAt.toISOString(),
        text: h.content.slice(0, 320),
        t: h.startSec ?? undefined, // second-precise jump when available
      }));

    return NextResponse.json({ snippets });
  } catch (err) {
    // Embeddings can fail (no quota, rate limit, outage) — live recall is
    // best-effort, so never surface an error into the meeting UI.
    console.error("memory recall failed:", err);
    return NextResponse.json({ snippets: [] });
  }
}
