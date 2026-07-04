import { prisma } from "@/lib/prisma";
import { embedOne, toVectorLiteral, isEmbeddingsConfigured } from "@/lib/embeddings";

export interface ChunkHit {
  meetingId: string;
  content: string;
  ordinal: number;
  distance: number; // cosine distance (lower = closer)
  title: string;
  createdAt: Date;
  meetingType: string;
}

/**
 * Semantic search over a single org's meeting chunks (cosine distance via
 * pgvector `<=>`). The orgId filter is security-critical — it scopes results to
 * one tenant and must never be omitted.
 */
export async function searchChunks(orgId: string, query: string, k = 8): Promise<ChunkHit[]> {
  if (!isEmbeddingsConfigured() || !query.trim()) return [];
  const vec = toVectorLiteral(await embedOne(query));

  const rows = await prisma.$queryRaw<ChunkHit[]>`
    SELECT c."meetingId", c.content, c.ordinal,
           (c.embedding <=> ${vec}::vector) AS distance,
           m.title, m."createdAt", m."meetingType"
    FROM "MeetingChunk" c
    JOIN "Meeting" m ON m.id = c."meetingId"
    WHERE c."orgId" = ${orgId}
    ORDER BY c.embedding <=> ${vec}::vector
    LIMIT ${k}
  `;

  // Prisma returns the computed distance as a string/Decimal in some drivers.
  return rows.map((r) => ({ ...r, distance: Number(r.distance) }));
}
