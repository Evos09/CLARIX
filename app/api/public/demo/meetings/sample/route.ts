import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateAnonymousContext } from "@/lib/auth";
import { SAMPLE_MEETING_DATA } from "@/lib/site/sampleMeeting";

export async function POST() {
  const ctx = await getOrCreateAnonymousContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  // Create a fully processed sample meeting for the user instantly
  const meeting = await prisma.meeting.create({
    data: {
      title: SAMPLE_MEETING_DATA.title,
      meetingType: SAMPLE_MEETING_DATA.meetingType,
      detectedType: SAMPLE_MEETING_DATA.detectedType,
      duration: SAMPLE_MEETING_DATA.duration,
      speakerCount: SAMPLE_MEETING_DATA.speakerCount,
      language: SAMPLE_MEETING_DATA.language,
      status: "COMPLETE",
      rawTranscript: SAMPLE_MEETING_DATA.rawTranscript,
      transcriptSegments: SAMPLE_MEETING_DATA.transcriptSegments as any,
      keyPoints: SAMPLE_MEETING_DATA.keyPoints as any,
      speakerMap: SAMPLE_MEETING_DATA.speakerMap as any,
      structuredOutput: SAMPLE_MEETING_DATA.structuredOutput as any,
      orgId: ctx.orgId,
      userId: ctx.userId,
      actionItemRecords: {
        createMany: {
          data: SAMPLE_MEETING_DATA.structuredOutput.actionItems.map((item) => ({
            task: item.task,
            owner: item.owner,
            dueDate: item.dueDate,
            priority: item.priority,
            completed: false,
            orgId: ctx.orgId,
          })),
        },
      },
    },
  });

  return NextResponse.json({ id: meeting.id, status: meeting.status });
}
