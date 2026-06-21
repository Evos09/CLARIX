import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "prospect": "",
  "budget": "",
  "timeline": "",
  "decisionMakers": [],
  "painPoints": [],
  "qualificationScore": "STRONG|MEDIUM|WEAK",
  "recommendedNextStep": ""
}`,
  guidance: "Qualify the prospect: budget, timeline, decision makers, pain points, and an overall qualification score.",
};
export default spec;
