import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssemblyAI } from "@/lib/assemblyai";
import { ingestTranscript } from "@/lib/transcription";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.ASSEMBLYAI_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-clarix-webhook") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { transcript_id?: string; status?: string }
    | null;
  const transcriptId = body?.transcript_id;
  if (!transcriptId) {
    return NextResponse.json({ error: "Missing transcript_id" }, { status: 400 });
  }

  const meeting = await prisma.meeting.findFirst({ where: { transcriptJobId: transcriptId } });
  if (!meeting) return NextResponse.json({ ok: true, skipped: true });

  try {
    const transcript = await getAssemblyAI().transcripts.get(transcriptId);
    await ingestTranscript(meeting.id, transcript);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("assemblyai webhook: ingest failed for meeting", meeting.id, e);
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { status: "ERROR", errorMessage: `Could not read the transcript: ${msg}` },
    });
  }
  return NextResponse.json({ ok: true });
}
