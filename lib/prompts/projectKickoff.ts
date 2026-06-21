import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "projectName": "",
  "goals": [],
  "scope": "",
  "outOfScope": [],
  "milestones": [{ "name": "", "targetDate": "" }],
  "risks": [],
  "owners": [{ "name": "", "responsibility": "" }]
}`,
  guidance: "Capture project goals, scope vs out-of-scope, milestones with dates, risks, and owners.",
};
export default spec;
