import { claudeText } from "@/lib/claude";

/** Generates a follow-up email or Slack message from the meeting context via Claude. */
export async function generateDraft(opts: {
  kind: "email" | "slack";
  title: string;
  transcript: string;
  structured: unknown;
}): Promise<string> {
  const style =
    opts.kind === "email"
      ? "a concise, professional follow-up email (with a subject line) recapping decisions and listing action items with owners"
      : "a clean Slack message using short lines and bullet points summarizing decisions and action items";
  const prompt = `Based on this meeting, write ${style}.
Meeting: ${opts.title}

Structured analysis:
${JSON.stringify(opts.structured ?? {}, null, 2)}

Transcript (for reference):
"""
${opts.transcript.slice(0, 8000)}
"""

Return only the ${opts.kind} text, ready to send.`;
  return claudeText({ prompt, maxTokens: 1024, temperature: 0.4 });
}
