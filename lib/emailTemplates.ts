import type { BaseOutput } from "@/lib/outputTypes";

export type EmailType = "SUMMARY" | "ACTION_ITEMS" | "FULL_REPORT";

function shell(title: string, inner: string, url: string): string {
  return `<div style="background:#F7F9FC;padding:24px 0;font-family:Inter,Arial,sans-serif;color:#334455">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#0b0b14;padding:18px 24px">
      <span style="color:#fff;font-weight:700;font-size:20px">CLAR<span style="color:#6d28d9">IX</span></span>
    </div>
    <div style="height:3px;background:#6d28d9"></div>
    <div style="padding:24px">
      <h1 style="font-size:22px;color:#0b0b14;margin:0 0 16px">${title}</h1>
      ${inner}
      <a href="${url}" style="display:inline-block;margin-top:20px;background:#6d28d9;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Open in CLARIX &rarr;</a>
    </div>
    <div style="padding:14px 24px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:11px">Sent by CLARIX</div>
  </div>
</div>`;
}

function label(t: string): string {
  return `<div style="font-size:12px;text-transform:uppercase;color:#94a3b8;letter-spacing:.05em;margin:18px 0 6px">${t}</div>`;
}

function actionsTable(output: BaseOutput): string {
  const items = output.actionItems ?? [];
  if (!items.length) return "<p style='color:#94a3b8'>No action items.</p>";
  const rows = items
    .map(
      (a) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eef2f7">${a.task ?? ""}</td><td style="padding:8px;border-bottom:1px solid #eef2f7"><span style="background:#e6faf7;color:#5b21b6;padding:2px 8px;border-radius:10px;font-size:12px">${a.owner ?? "Unassigned"}</span></td><td style="padding:8px;border-bottom:1px solid #eef2f7;color:#94a3b8">${a.dueDate ?? "&mdash;"}</td></tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px"><tr><th style="text-align:left;padding:8px;color:#94a3b8;font-size:12px">TASK</th><th style="text-align:left;padding:8px;color:#94a3b8;font-size:12px">OWNER</th><th style="text-align:left;padding:8px;color:#94a3b8;font-size:12px">DUE</th></tr>${rows}</table>`;
}

export function meetingEmailHtml(opts: {
  type: EmailType;
  title: string;
  typeLabel: string;
  date: string;
  output: BaseOutput;
  url: string;
}): { subject: string; html: string } {
  const o = opts.output;
  let inner = "";
  let subject = "";

  if (opts.type === "SUMMARY") {
    subject = `Summary: ${opts.title}`;
    inner = `${label("Summary")}<p>${o.tldr ?? ""}</p>`;
    if (o.keyDecisions?.length) {
      inner += label("Key Decisions") + "<ul>" + o.keyDecisions.map((d) => `<li>${d}</li>`).join("") + "</ul>";
    }
  } else if (opts.type === "ACTION_ITEMS") {
    subject = `Action items: ${opts.title}`;
    inner = label("Action Items") + actionsTable(o);
  } else {
    subject = `Report: ${opts.title}`;
    inner = `${label("Summary")}<p>${o.tldr ?? ""}</p>`;
    if (o.keyDecisions?.length) inner += label("Key Decisions") + "<ul>" + o.keyDecisions.map((d) => `<li>${d}</li>`).join("") + "</ul>";
    inner += label("Action Items") + actionsTable(o);
    if (o.openQuestions?.length) inner += label("Open Questions") + "<ul>" + o.openQuestions.map((q) => `<li>${q}</li>`).join("") + "</ul>";
  }

  inner = `<div style="color:#94a3b8;font-size:13px;margin-bottom:8px">${opts.typeLabel} &middot; ${opts.date}</div>` + inner;
  return { subject, html: shell(opts.title, inner, opts.url) };
}
