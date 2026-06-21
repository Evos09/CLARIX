import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "participants": [{ "name": "", "yesterday": "", "today": "", "blockers": "" }],
  "teamBlockers": [],
  "sprintHealth": "ON_TRACK|AT_RISK|BLOCKED"
}`,
  guidance: "Capture each person's yesterday/today/blockers. Surface shared blockers and overall sprint health.",
};
export default spec;
