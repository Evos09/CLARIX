import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "candidate": "",
  "role": "",
  "strengthsObserved": [],
  "concernsObserved": [],
  "questionsAsked": [],
  "hireSignal": "STRONG_YES|YES|MAYBE|NO",
  "interviewerNotes": ""
}`,
  guidance: "Summarize the candidate's strengths, concerns, questions asked, and a hire signal grounded in evidence.",
};
export default spec;
