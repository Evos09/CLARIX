import Anthropic from "@anthropic-ai/sdk";

/** Models used across CLARIX for analysis, auto-detect, and Ask CLARIX. */
export const CLAUDE_SONNET = "claude-sonnet-4-6";
export const CLAUDE_HAIKU = "claude-haiku-4-5";
export const CLAUDE_MODEL = CLAUDE_SONNET;

let client: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Calls Claude and returns the concatenated text output.
 * Strips markdown code fences so callers can JSON.parse directly.
 */
export async function claudeText(opts: {
  system?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}): Promise<string> {
  const model = opts.model ?? CLAUDE_MODEL;
  const res = await getClaude().messages.create({
    model,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.2,
    system: opts.system,
    messages: [{ role: "user", content: opts.prompt }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/** Parses Claude output as JSON, tolerating ```json fences and stray prose. */
export function parseJson<T = unknown>(raw: string): T {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  // Fall back to the first {...} or [...] block.
  if (!text.startsWith("{") && !text.startsWith("[")) {
    const obj = text.match(/[{[][\s\S]*[}\]]/);
    if (obj) text = obj[0];
  }
  return JSON.parse(text) as T;
}

/** Multi-turn chat completion. Returns the assistant's text reply. */
export async function claudeChat(opts: {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const model = opts.model ?? CLAUDE_MODEL;
  const res = await getClaude().messages.create({
    model,
    max_tokens: opts.maxTokens ?? 1024,
    system: opts.system,
    messages: opts.messages,
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
