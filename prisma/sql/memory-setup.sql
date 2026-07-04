-- Cross-meeting memory (pgvector) setup — run manually against the database.
--
-- ORDER MATTERS:
--   1. Run the CREATE EXTENSION below FIRST (the vector type must exist before
--      `prisma db push` can create the MeetingChunk.embedding column).
--   2. Run `npx prisma db push` to create the "MeetingChunk" table.
--   3. Run the CREATE INDEX below LAST (needs the table to exist).
--
-- Supabase: you can also enable "vector" from Database > Extensions instead of
-- step 1.

-- Step 1 — before `prisma db push`:
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 3 — after `prisma db push`:
-- HNSW index for fast cosine similarity search (embedding <=> query).
CREATE INDEX IF NOT EXISTS meetingchunk_embedding_idx
  ON "MeetingChunk" USING hnsw (embedding vector_cosine_ops);
