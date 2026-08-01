import type { ChunkFilter } from "@/lib/memory/search";

export type RangePreset = "week" | "month" | "quarter" | "year";

export interface ResolvedRange extends ChunkFilter {
  label: string; // human label for the UI chip / answer context, e.g. "Q3 2025"
}

/** Start of the quarter (0-indexed q: 0=Q1) for a given year, in UTC. */
function quarterStart(year: number, q: number): Date {
  return new Date(Date.UTC(year, q * 3, 1));
}

/**
 * Resolve an explicit UI preset ("this week/month/quarter/year") into a date
 * window ending now. `now` is injected so callers stay testable/deterministic.
 */
export function resolvePreset(preset: RangePreset, now: Date): ResolvedRange {
  const y = now.getUTCFullYear();
  switch (preset) {
    case "week": {
      const after = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { after, label: "the last 7 days" };
    }
    case "month": {
      const after = new Date(Date.UTC(y, now.getUTCMonth(), 1));
      return { after, label: "this month" };
    }
    case "quarter": {
      const q = Math.floor(now.getUTCMonth() / 3);
      return { after: quarterStart(y, q), label: `Q${q + 1} ${y}` };
    }
    case "year":
      return { after: new Date(Date.UTC(y, 0, 1)), label: `${y}` };
  }
}

/**
 * Best-effort parse of a date range mentioned in free text — so
 * "What happened in the Q3 meetings?" scopes to that quarter without the user
 * touching a filter. Recognizes: "Qn [year]", "this/last week|month|quarter|year",
 * "yesterday", "today", "last N days". Returns null when nothing is found, in
 * which case search runs unscoped (topic-only).
 */
export function parseDateFilter(query: string, now: Date): ResolvedRange | null {
  const q = query.toLowerCase();
  const y = now.getUTCFullYear();

  // Quarter: "Q3", "q3 2024", "third quarter"
  const qm = q.match(/\bq([1-4])\b(?:\s*(20\d{2}))?/) ?? q.match(/\b(first|second|third|fourth)\s+quarter\b/);
  if (qm) {
    const map: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4 };
    const qn = (map[qm[1]] ?? Number(qm[1])) - 1;
    const year = qm[2] ? Number(qm[2]) : y;
    return { after: quarterStart(year, qn), before: quarterStart(year, qn + 1), label: `Q${qn + 1} ${year}` };
  }

  if (/\blast week\b/.test(q)) {
    const before = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const after = new Date(before.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { after, before, label: "last week" };
  }
  if (/\bthis week\b/.test(q)) return resolvePreset("week", now);

  if (/\blast month\b/.test(q)) {
    const after = new Date(Date.UTC(y, now.getUTCMonth() - 1, 1));
    const before = new Date(Date.UTC(y, now.getUTCMonth(), 1));
    return { after, before, label: "last month" };
  }
  if (/\bthis month\b/.test(q)) return resolvePreset("month", now);

  if (/\blast quarter\b/.test(q)) {
    const cq = Math.floor(now.getUTCMonth() / 3);
    const year = cq === 0 ? y - 1 : y;
    const qn = cq === 0 ? 3 : cq - 1;
    return { after: quarterStart(year, qn), before: quarterStart(year, qn + 1), label: `Q${qn + 1} ${year}` };
  }
  if (/\bthis quarter\b/.test(q)) return resolvePreset("quarter", now);

  if (/\b(this year|last year)\b/.test(q)) {
    const year = q.includes("last year") ? y - 1 : y;
    return { after: new Date(Date.UTC(year, 0, 1)), before: new Date(Date.UTC(year + 1, 0, 1)), label: `${year}` };
  }

  if (/\byesterday\b/.test(q)) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    return { after: start, before: end, label: "yesterday" };
  }
  if (/\btoday\b/.test(q)) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    return { after: start, label: "today" };
  }

  const dn = q.match(/\blast (\d{1,3}) days\b/);
  if (dn) {
    const days = Math.min(Number(dn[1]), 366);
    return { after: new Date(now.getTime() - days * 24 * 60 * 60 * 1000), label: `the last ${days} days` };
  }

  return null;
}
