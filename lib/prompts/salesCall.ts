import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "prospect": "",
  "painPoints": [],
  "objections": [{ "objection": "", "response": "" }],
  "nextStep": "",
  "dealStage": "DISCOVERY|DEMO|PROPOSAL|NEGOTIATION|CLOSED",
  "buyingSignals": [],
  "redFlags": []
}`,
  guidance: "Identify the prospect, pain points, objections with how they were handled, buying signals, red flags, and the next step.",
};
export default spec;
