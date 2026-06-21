import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "employee": "",
  "period": "",
  "overallRating": "",
  "goalsAchieved": [],
  "improvementAreas": [],
  "goalsForNextPeriod": [],
  "compensationDiscussed": false
}`,
  guidance: "Summarize ratings, goals achieved, improvement areas, and next-period goals. Note if compensation was discussed.",
};
export default spec;
