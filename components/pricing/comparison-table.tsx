import { Fragment } from "react";
import { Check, Minus } from "lucide-react";

type Cell = boolean | string;

const planNames = ["Free", "Starter", "Pro", "Enterprise"];

const groups: { group: string; rows: { label: string; values: [Cell, Cell, Cell, Cell] }[] }[] = [
  {
    group: "Meetings & capture",
    rows: [
      { label: "Meetings per month", values: ["10", "20", "Unlimited", "Unlimited"] },
      { label: "In-browser recording", values: [true, true, true, true] },
      { label: "File upload", values: [true, true, true, true] },
      { label: "Auto-join meeting bot", values: [false, true, true, true] },
      { label: "Live captions & coaching", values: [false, false, true, true] },
    ],
  },
  {
    group: "Outputs & AI",
    rows: [
      { label: "Meeting types", values: ["General", "All 20+", "All 20+", "All 20+ + Verticals"] },
      { label: "Summary & action items", values: [true, true, true, true] },
      { label: "Ask CLARIX chat", values: [false, false, true, true] },
      { label: "Advanced Voice Mode (Coming Soon)", values: [false, false, true, true] },
      { label: "Audio library & reprocessing", values: [false, false, true, true] },
      { label: "Custom AI templates", values: [false, false, false, true] },
    ],
  },
  {
    group: "Export & sharing",
    rows: [
      { label: "PDF export", values: [false, true, true, true] },
      { label: "DOCX & CSV export", values: [false, true, true, true] },
      { label: "Team sharing", values: [false, true, true, true] },
    ],
  },
  {
    group: "Integrations",
    rows: [
      { label: "Email", values: [false, true, true, true] },
      { label: "Calendar, Slack, Notion, Linear", values: [false, false, true, true] },
      { label: "Salesforce & HubSpot CRM", values: [false, false, false, true] },
    ],
  },
  {
    group: "Security & support",
    rows: [
      { label: "SSO / SAML", values: [false, false, false, true] },
      { label: "HIPAA with signed BAA", values: [false, false, false, true] },
      { label: "Desktop app (Mac & Windows)", values: [false, false, false, true] },
      { label: "SLA & priority support", values: [false, false, false, true] },
    ],
  },
];

function renderCell(value: Cell) {
  if (value === true) return <Check className="w-4 h-4 text-brand mx-auto" />;
  if (value === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm text-foreground/80">{value}</span>;
}

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr>
            <th className="text-left py-5 pr-4 align-bottom">
              <span className="text-sm font-medium text-muted-foreground">Compare plans</span>
            </th>
            {planNames.map((name) => (
              <th key={name} className="py-5 px-4 text-center align-bottom">
                <span className={`font-display text-xl ${name === "Pro" ? "text-foreground" : "text-foreground"}`}>
                  {name}
                </span>
                {name === "Pro" && (
                  <span className="block mt-1 text-[10px] font-mono uppercase tracking-widest text-brand">
                    Popular
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.group}>
              <tr>
                <td
                  colSpan={5}
                  className="pt-8 pb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground border-b border-foreground/10"
                >
                  {group.group}
                </td>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-b border-foreground/10">
                  <td className="py-4 pr-4 text-sm text-foreground/80">{row.label}</td>
                  {row.values.map((value, i) => (
                    <td key={i} className="py-4 px-4 text-center">
                      {renderCell(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
