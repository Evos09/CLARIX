export interface ActionItem {
  task: string;
  owner?: string;
  dueDate?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
}

/** Base fields present on every meeting's structured output. */
export interface BaseOutput {
  title?: string;
  tldr?: string;
  keyDecisions?: string[];
  actionItems?: ActionItem[];
  followUpDate?: string;
  sentiment?: "POSITIVE" | "NEUTRAL" | "TENSE";
  topics?: string[];
  openQuestions?: string[];
  [key: string]: unknown;
}

const BASE_KEYS = new Set([
  "title", "tldr", "keyDecisions", "actionItems", "followUpDate",
  "sentiment", "topics", "openQuestions",
]);

/** Returns the non-base, type-specific keys of a structured output. */
export function extraKeys(output: BaseOutput): string[] {
  return Object.keys(output).filter((k) => !BASE_KEYS.has(k));
}
