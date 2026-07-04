/**
 * Splits a meeting transcript into overlapping, line-aware chunks for embedding.
 * Packs whole lines into ~`size`-char windows and carries a small `overlap` tail
 * into the next window so context isn't lost at boundaries.
 */
export interface Chunk {
  ordinal: number;
  content: string;
}

export function chunkTranscript(
  raw: string,
  opts?: { size?: number; overlap?: number },
): Chunk[] {
  const size = opts?.size ?? 1500;
  const overlap = opts?.overlap ?? 200;
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const units = text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: Chunk[] = [];
  let buf = "";
  let ordinal = 0;

  for (const unit of units) {
    if (buf && buf.length + unit.length + 1 > size) {
      chunks.push({ ordinal: ordinal++, content: buf });
      const tail = overlap > 0 ? buf.slice(-overlap) : "";
      buf = tail ? `${tail}\n${unit}` : unit;
    } else {
      buf = buf ? `${buf}\n${unit}` : unit;
    }
  }
  if (buf.trim()) chunks.push({ ordinal: ordinal++, content: buf });

  return chunks;
}
