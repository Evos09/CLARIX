import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { getAccessibleMeeting } from "@/lib/meetingAccess";
import { isAssemblyConfigured } from "@/lib/assemblyai";
import { syncTranscriptStatus } from "@/lib/transcription";
import { getSupabaseAdmin, AUDIO_BUCKET } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

const PatchBody = z.object({
  title: z.string().min(1).max(200).optional(),
  meetingType: z.string().optional(),
  structuredOutput: z.unknown().optional(),
});

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  let meeting = await getAccessibleMeeting(id, ctx);
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Poll fallback: advance state if the webhook hasn't reached us (e.g. localhost).
  if (meeting.status === "TRANSCRIBING" && meeting.transcriptJobId && isAssemblyConfigured()) {
    try {
      await syncTranscriptStatus(id);
      meeting = await getAccessibleMeeting(id, ctx);
    } catch {
      // leave status unchanged; client will retry on next poll
    }
  }
  return NextResponse.json(meeting);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const existing = await getAccessibleMeeting(id, ctx, { requireEdit: true });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.meeting.update({
    where: { id },
    data: {
      title: parsed.data.title,
      meetingType: parsed.data.meetingType,
      structuredOutput:
        parsed.data.structuredOutput === undefined
          ? undefined
          : (parsed.data.structuredOutput as object),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (meeting.storagePath) {
    try {
      await getSupabaseAdmin().storage.from(AUDIO_BUCKET).remove([meeting.storagePath]);
    } catch {
      // best-effort cleanup
    }
  }
  await prisma.meeting.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
