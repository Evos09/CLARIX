import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "vendor": "",
  "productsDiscussed": [],
  "pricingDiscussed": false,
  "openTerms": [],
  "redFlags": [],
  "recommendation": "PROCEED|HOLD|REJECT"
}`,
  guidance: "Capture products discussed, whether pricing came up, open terms, red flags, and a recommendation.",
};
export default spec;
