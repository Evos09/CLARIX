/**
 * OpenAI text embeddings for cross-meeting semantic search.
 * Model: text-embedding-3-small (1536 dims). Dormant until OPENAI_API_KEY is set
 * — every caller guards on isEmbeddingsConfigured() so nothing breaks when unset.
 */
export const EMBED_MODEL = "text-embedding-3-small";
export const EMBED_DIM = 1536;

export function isEmbeddingsConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/** Embeds a batch of strings; returns one vector per input, in order. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  if (!texts.length) return [];
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI embeddings failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  // Defend against out-of-order responses.
  return data.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

export async function embedOne(text: string): Promise<number[]> {
  return (await embedTexts([text]))[0];
}

/** Formats a vector as a pgvector literal, e.g. "[0.1,0.2,...]". */
export function toVectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}
