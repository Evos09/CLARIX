import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { isEmbeddingsConfigured, embedTexts, toVectorLiteral } from "@/lib/embeddings";
import { chunkTranscript, chunkSegments, type TimedChunk, type TimedSegment } from "./chunk";

/**
 * Embeds a meeting's transcript and (re)writes its MeetingChunk rows.
 * No-op (returns 0) when embeddings aren't configured or there's no transcript,
 * so it's safe to call unconditionally from the processing pipeline.
 * Returns the number of chunks written.
 *
 * The `embedding` column is a pgvector type Prisma can't express, so inserts go
 * through $executeRaw with a `'[...]'::vector` literal.
 */
export async function ingestMeeting(meetingId: string): Promise<number> {
  if (!isEmbeddingsConfigured()) return 0;

  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    select: { id: true, orgId: true, rawTranscript: true, transcriptSegments: true },
  });
  if (!meeting?.rawTranscript) return 0;

  // Prefer timed segments so each chunk carries a jump-to-source second. Fall
  // back to plain-text chunking (startSec = null) for legacy/text-only meetings.
  const segments = (meeting.transcriptSegments as unknown as TimedSegment[] | null) ?? [];
  const chunks: TimedChunk[] = segments.length
    ? chunkSegments(segments)
    : chunkTranscript(meeting.rawTranscript).map((c) => ({ ...c, startSec: null }));
  if (!chunks.length) return 0;

  const vectors = await embedTexts(chunks.map((c) => c.content));

  // Replace any existing chunks for this meeting (handles reprocessing).
  await prisma.meetingChunk.deleteMany({ where: { meetingId } });

  for (let i = 0; i < chunks.length; i++) {
    const literal = toVectorLiteral(vectors[i]);
    await prisma.$executeRaw`
      INSERT INTO "MeetingChunk" (id, "meetingId", "orgId", content, ordinal, "startSec", embedding, "createdAt")
      VALUES (${randomUUID()}, ${meeting.id}, ${meeting.orgId}, ${chunks[i].content}, ${chunks[i].ordinal}, ${chunks[i].startSec}, ${literal}::vector, now())
    `;
  }

  return chunks.length;
}
