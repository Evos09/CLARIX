/**
 * Splits a meeting transcript into overlapping, line-aware chunks for embedding.
 * Packs whole lines into ~`size`-char windows and carries a small `overlap` tail
 * into the next window so context isn't lost at boundaries.
 */
export interface Chunk {
  ordinal: number;
  content: string;
}

/** A chunk that also knows where it starts in the recording (whole seconds). */
export interface TimedChunk extends Chunk {
  startSec: number | null;
}

/** One timed transcript line for the segment-aware chunker. */
export interface TimedSegment {
  speaker?: string;
  text: string;
  start: number; // seconds
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

/**
 * Segment-aware variant: packs whole timed segments into the same ~`size`
 * windows as chunkTranscript, but records each window's start time (the start of
 * its first segment) so hits can jump straight to that second in the audio.
 * Lines mirror the stored rawTranscript ("Speaker X: text") so excerpt text and
 * phrase fallbacks stay identical to the plain-text path.
 */
export function chunkSegments(
  segments: TimedSegment[],
  opts?: { size?: number; overlap?: number },
): TimedChunk[] {
  const size = opts?.size ?? 1500;
  const overlap = opts?.overlap ?? 200;

  const chunks: TimedChunk[] = [];
  let buf = "";
  let bufStart: number | null = null;
  let ordinal = 0;

  for (const seg of segments) {
    const line = (seg.speaker != null ? `Speaker ${seg.speaker}: ${seg.text}` : seg.text).trim();
    if (!line) continue;
    const segStart = Number.isFinite(seg.start) ? Math.max(0, Math.floor(seg.start)) : null;

    if (buf && buf.length + line.length + 1 > size) {
      chunks.push({ ordinal: ordinal++, content: buf, startSec: bufStart });
      const tail = overlap > 0 ? buf.slice(-overlap) : "";
      buf = tail ? `${tail}\n${line}` : line;
      // The new window's jump target is where its fresh content begins.
      bufStart = segStart;
    } else {
      if (!buf) bufStart = segStart;
      buf = buf ? `${buf}\n${line}` : line;
    }
  }
  if (buf.trim()) chunks.push({ ordinal: ordinal++, content: buf, startSec: bufStart });

  return chunks;
}
