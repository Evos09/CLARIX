/**
 * Acronyms the generic title-caser would otherwise mangle — "okrsDrafted"
 * became "Okrs Drafted", which reads as a typo on a page we ask strangers to
 * judge us by. Keys are lowercase; a trailing plural "s" is handled separately
 * so "okrs" becomes "OKRs" rather than "OKRS".
 */
const ACRONYMS: Record<string, string> = {
  okr: "OKR", icd: "ICD", kpi: "KPI", roi: "ROI", faq: "FAQ",
  api: "API", sow: "SOW", nda: "NDA", pto: "PTO", qa: "QA",
};

function fixWord(word: string): string {
  const lower = word.toLowerCase();
  if (ACRONYMS[lower]) return ACRONYMS[lower];
  const singular = lower.slice(0, -1);
  if (lower.endsWith("s") && ACRONYMS[singular]) return `${ACRONYMS[singular]}s`;
  return word.replace(/^\w/, (c) => c.toUpperCase());
}

/** "actionItems" -> "Action Items", "okrsDrafted" -> "OKRs Drafted" */
export function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map(fixWord)
    .join(" ");
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
