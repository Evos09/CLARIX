import type { BaseOutput } from "@/lib/outputTypes";

function esc(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** Action items as CSV. */
export function meetingCsv(output: BaseOutput): string {
  const rows = [["Task", "Owner", "Due Date", "Priority"]];
  for (const a of output.actionItems ?? []) {
    rows.push([a.task ?? "", a.owner ?? "", a.dueDate ?? "", a.priority ?? ""]);
  }
  return rows.map((r) => r.map((c) => esc(String(c))).join(",")).join("\n");
}
