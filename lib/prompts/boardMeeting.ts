import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "attendees": [],
  "motionsPassed": [],
  "motionsRejected": [],
  "strategicPriorities": [],
  "metricsDiscussed": [],
  "nextBoardDate": ""
}`,
  guidance: "Record attendees, motions passed/rejected, strategic priorities, and metrics discussed.",
};
export default spec;
