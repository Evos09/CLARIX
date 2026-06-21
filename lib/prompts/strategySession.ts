import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "timeHorizon": "",
  "prioritiesSet": [],
  "initiativesApproved": [],
  "initiativesRejected": [],
  "okrsDrafted": [{ "objective": "", "keyResults": [] }]
}`,
  guidance: "Capture the time horizon, priorities, approved/rejected initiatives, and any OKRs drafted.",
};
export default spec;
