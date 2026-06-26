import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateAnonymousContext } from "@/lib/auth";
import { isAssemblyConfigured } from "@/lib/assemblyai";
import { startTranscription } from "@/lib/transcription";

const CreateBody = z.object({
  title: z.string().min(1).max(200),
  meetingType: z.string().default("GENERAL"),
  autoDetect: z.boolean().default(false),
  storagePath: z.string().min(1),
  audioSize: z.number().int().positive().optional(),
  audioFilename: z.string().max(255).optional(),
});

export async function POST(req: Request) {
  const ctx = await getOrCreateAnonymousContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  if (!isAssemblyConfigured()) {
    return NextResponse.json({ error: "Transcription service not configured" }, { status: 503 });
  }

  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { title, meetingType, autoDetect, storagePath, audioSize, audioFilename } = parsed.data;

  const meeting = await prisma.meeting.create({
    data: {
      title,
      meetingType: autoDetect ? "GENERAL" : meetingType,
      autoDetect,
      storagePath,
      audioSize,
      audioFilename,
      status: "UPLOADING",
      orgId: ctx.orgId,
      userId: ctx.userId,
    },
  });

  try {
    const jobId = await startTranscription(meeting.id);
    return NextResponse.json({ id: meeting.id, status: "TRANSCRIBING", transcriptJobId: jobId }, { status: 201 });
  } catch (err) {
    await prisma.meeting.update({ where: { id: meeting.id }, data: { status: "ERROR" } });
    const message = err instanceof Error ? err.message : "Transcription failed to start";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
