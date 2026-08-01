import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { embedOne, toVectorLiteral, isEmbeddingsConfigured } from "@/lib/embeddings";

export interface ChunkHit {
  meetingId: string;
  content: string;
  ordinal: number;
  startSec: number | null; // jump-to-source offset (seconds); null for legacy chunks
  distance: number; // cosine distance (lower = closer)
  title: string;
  createdAt: Date;
  meetingType: string;
}

/** Optional structured filters layered on top of the semantic match. */
export interface ChunkFilter {
  after?: Date; // only meetings on/after this instant
  before?: Date; // only meetings strictly before this instant
}

/**
 * Semantic search over a single org's meeting chunks (cosine distance via
 * pgvector `<=>`). The orgId filter is security-critical — it scopes results to
 * one tenant and must never be omitted.
 *
 * An optional date-range filter (on the source meeting's createdAt) narrows the
 * candidate set before ranking — this is the structured half of hybrid search
 * (e.g. "the Q3 meetings"), since embeddings alone rank topic well but dates
 * poorly.
 */
export async function searchChunks(
  orgId: string,
  query: string,
  k = 8,
  filter?: ChunkFilter,
): Promise<ChunkHit[]> {
  if (!isEmbeddingsConfigured() || !query.trim()) return [];
  const vec = toVectorLiteral(await embedOne(query));

  // Compose the WHERE clause: orgId is always present; date bounds are added
  // only when supplied, so the un-filtered path is byte-for-byte the old query.
  const conditions: Prisma.Sql[] = [Prisma.sql`c."orgId" = ${orgId}`];
  if (filter?.after) conditions.push(Prisma.sql`m."createdAt" >= ${filter.after}`);
  if (filter?.before) conditions.push(Prisma.sql`m."createdAt" < ${filter.before}`);
  const where = Prisma.join(conditions, " AND ");

  const rows = await prisma.$queryRaw<ChunkHit[]>(Prisma.sql`
    SELECT c."meetingId", c.content, c.ordinal, c."startSec",
           (c.embedding <=> ${vec}::vector) AS distance,
           m.title, m."createdAt", m."meetingType"
    FROM "MeetingChunk" c
    JOIN "Meeting" m ON m.id = c."meetingId"
    WHERE ${where}
    ORDER BY c.embedding <=> ${vec}::vector
    LIMIT ${k}
  `);

  // Prisma returns the computed distance as a string/Decimal in some drivers.
  return rows.map((r) => ({
    ...r,
    distance: Number(r.distance),
    startSec: r.startSec == null ? null : Number(r.startSec),
  }));
}
