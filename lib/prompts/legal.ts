import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "summary": "",
  "keyStatements": [{ "speaker": "", "statement": "", "significance": "" }],
  "exhibits": [],
  "discoveryItems": [],
  "timelineEntries": [{ "date": "", "event": "" }]
}`,
  guidance: "Capture key admissions/statements with significance, exhibits referenced, discovery items, and a case timeline.",
};
export default spec;
