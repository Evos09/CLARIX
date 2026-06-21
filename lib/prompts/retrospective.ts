import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "wentWell": [],
  "didntGoWell": [],
  "experimentsToTry": [],
  "teamMood": "HIGH|MEDIUM|LOW"
}`,
  guidance: "Summarize what went well, what didn't, experiments to try, and overall team mood.",
};
export default spec;
