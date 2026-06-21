import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "announcements": [],
  "questionsFromAudience": [{ "question": "", "answer": "" }],
  "keyMessages": [],
  "followUpItems": []
}`,
  guidance: "Capture announcements, audience Q&A pairs, key messages, and follow-up items.",
};
export default spec;
