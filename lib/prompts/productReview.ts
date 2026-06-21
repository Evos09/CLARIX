import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "featuresReviewed": [],
  "feedbackByFeature": [{ "feature": "", "feedback": "", "verdict": "SHIP|REVISE|CUT" }],
  "shippingDecisions": [],
  "technicalDebt": []
}`,
  guidance: "Capture features reviewed, per-feature feedback with a verdict, shipping decisions, and tech debt noted.",
};
export default spec;
