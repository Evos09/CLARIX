import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { isAssemblyConfigured } from "@/lib/assemblyai";
import { startTranscription } from "@/lib/transcription";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  if (!isAssemblyConfigured()) {
    return NextResponse.json({ error: "Transcription not configured (ASSEMBLYAI_API_KEY)" }, { status: 503 });
  }

  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const jobId = await startTranscription(id);
    return NextResponse.json({ ok: true, transcriptJobId: jobId, status: "TRANSCRIBING" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed to start";
    await prisma.meeting.update({
      where: { id },
      data: { status: "ERROR", errorMessage: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
