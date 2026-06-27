import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import type { TranscriptSegment } from "@/lib/transcription";
import { Prisma } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const { speakerMap } = body || {};

  if (!speakerMap || typeof speakerMap !== "object") {
    return NextResponse.json({ error: "Missing or invalid speakerMap" }, { status: 400 });
  }

  const meeting = await prisma.meeting.findUnique({
    where: { id },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  if (meeting.orgId !== ctx.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Update segments speaker labels using the new speakerMap
  const segments = (meeting.transcriptSegments as unknown as TranscriptSegment[]) || [];
  const updatedSegments = segments.map((s) => {
    // If the speaker name has been mapped in speakerMap, update it
    const mappedName = speakerMap[s.speaker];
    if (mappedName) {
      return { ...s, speaker: mappedName };
    }
    return s;
  });

  const updatedRawTranscript = updatedSegments
    .map((s) => `Speaker ${s.speaker}: ${s.text}`)
    .join("\n");

  const updatedMeeting = await prisma.meeting.update({
    where: { id },
    data: {
      speakerMap: speakerMap as Prisma.InputJsonValue,
      transcriptSegments: updatedSegments as unknown as Prisma.InputJsonValue,
      rawTranscript: updatedRawTranscript,
    },
  });

  return NextResponse.json({
    success: true,
    speakerMap: updatedMeeting.speakerMap,
  });
}
