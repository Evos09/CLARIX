import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAssemblyConfigured } from "@/lib/assemblyai";
import { syncTranscriptStatus } from "@/lib/transcription";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Shared secret check — Bearer or x-cron-secret header. Fails closed. */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return (
    req.headers.get("authorization") === `Bearer ${secret}` ||
    req.headers.get("x-cron-secret") === secret
  );
}

/** Don't fight an in-flight job: only sweep meetings that have had time to finish. */
const MIN_AGE_MINUTES = 10;

/**
 * Rescues meetings stranded in TRANSCRIBING.
 *
 * AssemblyAI calls us back when a transcript finishes, and until now that
 * callback was the only thing that moved a meeting forward — the sole fallback
 * being the poll inside GET /api/meetings/[id], which requires a human to open
 * that exact meeting. So one lost webhook stranded a recording indefinitely and
 * the user just saw "Transcribing" forever, with no error raised anywhere.
 *
 * That is not hypothetical: NEXT_PUBLIC_APP_URL pointed the callback at the
 * apex domain, which 301s to www and drops the path, so every callback landed
 * on the homepage and returned 200. AssemblyAI counted each as delivered and
 * never retried, while the handler was never invoked.
 *
 * Webhooks will fail again for other reasons — deploys, DNS, provider outages —
 * so this closes the gap for good. Each meeting is swept independently; one
 * failure cannot abort the run.
 */
export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAssemblyConfigured()) {
    return NextResponse.json(
      { error: "Transcription not configured (ASSEMBLYAI_API_KEY)" },
      { status: 503 },
    );
  }

  const cutoff = new Date(Date.now() - MIN_AGE_MINUTES * 60_000);
  const stranded = await prisma.meeting.findMany({
    where: {
      status: "TRANSCRIBING",
      transcriptJobId: { not: null },
      createdAt: { lt: cutoff },
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  let recovered = 0;
  let stillRunning = 0;
  const errors: string[] = [];

  for (const m of stranded) {
    try {
      await syncTranscriptStatus(m.id);
      // syncTranscriptStatus only ingests once AssemblyAI reports a terminal
      // state, so re-read to see whether this one actually moved.
      const after = await prisma.meeting.findUnique({
        where: { id: m.id },
        select: { status: true },
      });
      if (after && after.status !== "TRANSCRIBING") recovered++;
      else stillRunning++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("sweep-transcripts failed for meeting", m.id, e);
      if (errors.length < 5) errors.push(`${m.id}: ${msg}`);
    }
  }

  return NextResponse.json({ checked: stranded.length, recovered, stillRunning, errors });
}
