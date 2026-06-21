import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "sprintGoal": "",
  "storiesCommitted": [{ "title": "", "points": 0, "owner": "" }],
  "totalPoints": 0,
  "dependencies": [],
  "risks": []
}`,
  guidance: "Record the sprint goal, committed stories with points and owners, total points, dependencies, and risks.",
};
export default spec;
