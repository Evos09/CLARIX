import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "clientSummary": "",
  "investmentGoals": [],
  "riskTolerance": "",
  "recommendations": [{ "product": "", "rationale": "", "suitabilityFlag": false }],
  "disclosuresGiven": [],
  "complianceFlags": [],
  "nextReviewDate": ""
}`,
  guidance: "Capture goals, risk tolerance, recommendations with suitability flags, disclosures given, and compliance flags.",
};
export default spec;
