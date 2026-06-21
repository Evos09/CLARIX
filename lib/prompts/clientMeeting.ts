import type { PromptSpec } from "./base";
const spec: PromptSpec = {
  extraSchema: `{
  "clientName": "",
  "deliverablesPromised": [{ "item": "", "dueDate": "" }],
  "clientConcerns": [],
  "satisfactionSignal": "HAPPY|NEUTRAL|CONCERNED",
  "nextMeetingDate": ""
}`,
  guidance: "Record deliverables promised with due dates, client concerns, satisfaction signal, and next meeting.",
};
export default spec;
