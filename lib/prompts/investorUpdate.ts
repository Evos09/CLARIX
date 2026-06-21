import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "kpisReported": [{ "metric": "", "value": "", "trend": "UP|DOWN|FLAT" }],
  "asks": [],
  "commitmentsFromInvestors": [],
  "concerns": [],
  "nextUpdateDate": ""
}`,
  guidance: "Capture KPIs with trends, founder asks, investor commitments, and concerns raised.",
};
export default spec;
