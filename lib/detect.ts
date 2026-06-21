import { claudeText, parseJson, isClaudeConfigured } from "@/lib/claude";
import { DETECTABLE_TYPE_IDS, getMeetingType } from "@/lib/meetingTypes";

export interface DetectionResult {
  type: string;
  reason: string;
}

/** Sends the first ~1500 words of a transcript to Claude to classify the meeting type. */
export async function detectMeetingType(transcript: string): Promise<DetectionResult> {
  if (!isClaudeConfigured()) throw new Error("ANTHROPIC_API_KEY is not set");

  const excerpt = transcript.split(/\s+/).slice(0, 1500).join(" ");
  const prompt = `Given this meeting transcript excerpt, identify the most likely meeting type from this list:
[${DETECTABLE_TYPE_IDS.join(", ")}].
Return only the type label and a 1-sentence reason. Format: JSON
{"type": "SALES_CALL", "reason": "Participants discuss pricing objections and a demo follow-up."}

Transcript excerpt:
"""
${excerpt}
"""`;

  const raw = await claudeText({ prompt, maxTokens: 200, temperature: 0 });
  const parsed = parseJson<DetectionResult>(raw);
  // Validate against the known set; fall back to GENERAL.
  const valid = DETECTABLE_TYPE_IDS.includes(parsed.type) ? parsed.type : "GENERAL";
  return { type: getMeetingType(valid).id, reason: parsed.reason ?? "" };
}
