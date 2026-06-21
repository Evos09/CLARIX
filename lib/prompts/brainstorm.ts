import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "topic": "",
  "ideasGenerated": [],
  "topIdeas": [],
  "ideasRejected": [],
  "nextExploration": ""
}`,
  guidance: "List all ideas generated, the top picks, rejected ideas, and what to explore next.",
};
export default spec;
