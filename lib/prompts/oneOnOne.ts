import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "participants": ["Manager", "Report"],
  "feedbackGiven": [],
  "goalsDiscussed": [],
  "supportNeeded": [],
  "moodCheck": "",
  "growthNotes": ""
}`,
  guidance: "Capture feedback exchanged, goals, support needed, mood, and growth notes. Be discreet and constructive.",
};
export default spec;
