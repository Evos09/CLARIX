import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "topic": "",
  "facilitator": "",
  "keyLearnings": [],
  "attendeeTakeaways": [],
  "resourcesShared": [],
  "certificationOrQuizNeeded": false
}`,
  guidance: "Capture key learnings, attendee takeaways, resources shared, and whether a quiz/certification is needed.",
};
export default spec;
