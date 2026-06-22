export const coachingCategories: Record<string, string[]> = {
  SALES_CALL: ["qualification", "objection", "timeline", "next_step", "pricing"],
  STANDUP: ["timebox", "blocker", "alignment"],
  CLIENT_MEETING: ["commitment", "stakeholder", "followup"],
  ONE_ON_ONE: ["feedback", "goal", "support"],
  DISCOVERY_CALL: ["pain_point", "budget", "decision_maker"],
  GENERAL: ["participation", "decision", "action_item", "followup"],
};

export function coachingPrompt(transcript: string, meetingType: string, previousSuggestions: string[]): string {
  return `You are CLARIX, a real-time meeting coach. The meeting is currently in progress.
Meeting type: ${meetingType}

Based on the transcript so far, provide 1-3 SHORT, actionable suggestions to help the participant right now. Be specific and direct. Max 12 words each.

Do not repeat these already-shown suggestions: ${previousSuggestions.join(" | ") || "(none yet)"}

Return ONLY a JSON array of strings, no preamble:
["Suggestion 1", "Suggestion 2"]

Examples by meeting type:
SALES_CALL: "Ask about their current vendor.", "Mention the ROI case study.", "Get a timeline commitment."
STANDUP: "Ask Mark about his blocker.", "Timebox — you are at 15 minutes.", "Confirm sprint goal alignment."
CLIENT_MEETING: "Recap what you have promised so far.", "Ask if they have other stakeholders.", "Set next meeting date."

Transcript so far:
${transcript.slice(-6000)}`;
}
