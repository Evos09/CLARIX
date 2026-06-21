export const BASE_SYSTEM = `You are CLARIX, an expert meeting analyst. You read a meeting transcript and produce a precise, structured JSON summary.
Rules:
- Output ONLY valid JSON — no prose, no markdown code fences.
- Use participants' names when identifiable; otherwise use the speaker labels.
- Be specific and faithful to the transcript; never invent facts.
- Use ISO 8601 dates (YYYY-MM-DD) when known, otherwise "".
- Use empty arrays [] when nothing applies.`;

export const BASE_SCHEMA = `{
  "title": "concise meeting title",
  "tldr": "2-3 sentence plain-English summary",
  "keyDecisions": ["..."],
  "actionItems": [{ "task": "", "owner": "", "dueDate": "", "priority": "HIGH|MEDIUM|LOW" }],
  "followUpDate": "",
  "sentiment": "POSITIVE|NEUTRAL|TENSE",
  "topics": ["..."],
  "openQuestions": ["..."]
}`;

export interface PromptSpec {
  /** JSON snippet of additional fields merged into the base schema. */
  extraSchema: string;
  /** Extra extraction guidance for this meeting type. */
  guidance?: string;
}

export function buildProcessingPrompt(opts: {
  typeLabel: string;
  spec: PromptSpec;
  transcript: string;
  instruction?: string;
  templateOverride?: string;
}): string {
  const merged = opts.spec.extraSchema
    ? `Also merge these ADDITIONAL fields into the SAME top-level JSON object:\n${opts.spec.extraSchema}`
    : "";
  return [
    `Analyze this ${opts.typeLabel} transcript and return a single JSON object.`,
    ``,
    `Base fields (always include):`,
    BASE_SCHEMA,
    ``,
    merged,
    opts.spec.guidance ? `Guidance: ${opts.spec.guidance}` : "",
    opts.templateOverride ? `Organization instructions: ${opts.templateOverride}` : "",
    opts.instruction ? `Additional instruction: ${opts.instruction}` : "",
    ``,
    `Transcript:`,
    `"""`,
    opts.transcript,
    `"""`,
    ``,
    `Return ONLY the JSON object.`,
  ]
    .filter(Boolean)
    .join("\n");
}
