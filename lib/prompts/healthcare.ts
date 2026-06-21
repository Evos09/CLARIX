import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "soap": { "subjective": "", "objective": "", "assessment": "", "plan": "" },
  "icdSuggestions": [],
  "medications": [{ "name": "", "dosage": "", "frequency": "" }],
  "allergyFlags": [],
  "followUpDate": ""
}`,
  guidance: "Produce a SOAP note, suggest plausible ICD-10 codes, extract medications with dosage/frequency, and flag allergies. These are AI suggestions for clinician review — not a diagnosis.",
};
export default spec;
