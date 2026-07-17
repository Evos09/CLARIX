import type { BaseOutput } from "@/lib/outputTypes";

// Minimal RFC 5545 (iCalendar) generator: emits the meeting as a VEVENT and
// each action item as a VTODO so users can drop meetings + tasks straight into
// Google/Apple/Outlook Calendar or any task app that reads .ics. Pure string
// building, no dependencies.

/** Escape a TEXT value per RFC 5545 §3.3.11 (backslash, semicolon, comma, newlines). */
function esc(s: string): string {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold a content line to <=75 octets (approximated by char length; content is ASCII-heavy). */
function fold(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [line.slice(0, 73)];
  let rest = line.slice(73);
  while (rest.length) {
    parts.push(" " + rest.slice(0, 72));
    rest = rest.slice(72);
  }
  return parts.join("\r\n");
}

/** UTC timestamp in iCalendar form: YYYYMMDDTHHMMSSZ. */
function stampUTC(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Parse a free-text due date into a YYYYMMDD DATE value, or null if it isn't a real date. */
function dateValue(s?: string | null): string | null {
  if (!s) return null;
  const t = Date.parse(s);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  const y = d.getUTCFullYear();
  if (y < 2000 || y > 2100) return null;
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${mm}${dd}`;
}

export function meetingIcs(opts: {
  meetingId: string;
  title: string;
  url: string;
  createdAt: Date;
  durationSec?: number | null;
  output: BaseOutput | null;
}): string {
  const { meetingId, title, url, createdAt, output } = opts;
  const now = stampUTC(new Date());
  const start = stampUTC(createdAt);
  const endMs = createdAt.getTime() + (opts.durationSec ? opts.durationSec * 1000 : 60 * 60 * 1000);
  const end = stampUTC(new Date(endMs));

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CLARIX//Meeting Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  // The meeting itself as an event.
  lines.push(
    "BEGIN:VEVENT",
    `UID:${meetingId}@clarixmeetings.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(`${output?.tldr ?? ""}\n\n${url}`)}`,
    `URL:${esc(url)}`,
    "END:VEVENT",
  );

  // Action items as to-dos.
  const items = Array.isArray(output?.actionItems) ? output.actionItems : [];
  items.forEach((it, i) => {
    if (!it || typeof it.task !== "string" || !it.task.trim()) return;
    const dv = dateValue(it.dueDate);
    const desc: string[] = [];
    if (it.owner) desc.push(`Owner: ${it.owner}`);
    if (it.priority) desc.push(`Priority: ${it.priority}`);
    if (it.dueDate && !dv) desc.push(`Due: ${it.dueDate}`);
    desc.push(url);
    lines.push(
      "BEGIN:VTODO",
      `UID:${meetingId}-todo-${i}@clarixmeetings.com`,
      `DTSTAMP:${now}`,
      `SUMMARY:${esc(it.task)}`,
      ...(dv ? [`DUE;VALUE=DATE:${dv}`] : []),
      ...(it.priority ? [`PRIORITY:${it.priority === "HIGH" ? 1 : it.priority === "LOW" ? 9 : 5}`] : []),
      `DESCRIPTION:${esc(desc.join("\n"))}`,
      "END:VTODO",
    );
  });

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
