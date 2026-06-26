import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateAnonymousContext } from "@/lib/auth";
import { isAssemblyConfigured } from "@/lib/assemblyai";
import { syncTranscriptStatus } from "@/lib/transcription";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateAnonymousContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  let meeting = await prisma.meeting.findFirst({
    where: { id, orgId: ctx.orgId },
    include: {
      actionItemRecords: true,
    },
  });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (meeting.status === "TRANSCRIBING" && meeting.transcriptJobId && isAssemblyConfigured()) {
    try {
      await syncTranscriptStatus(id);
      meeting = await prisma.meeting.findFirst({
        where: { id, orgId: ctx.orgId },
        include: {
          actionItemRecords: true,
        },
      });
    } catch {
      // ignore, let client retry
    }
  }

  return NextResponse.json(meeting);
}
