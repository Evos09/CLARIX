import { prisma } from "@/lib/prisma";

/*
  Open / overdue action-item digest. Pure functions over existing models —
  no schema change. Consumed by /api/cron/digest.
*/

const PRIORITY_RANK: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

/** Whether a digest is due given its frequency + last send time. */
export function digestDue(frequency: string, lastSentAt: Date | null, now = new Date()): boolean {
  if (!lastSentAt) return true;
  const hours = (now.getTime() - lastSentAt.getTime()) / 3_600_000;
  return frequency === "WEEKLY" ? hours >= 24 * 6.5 : hours >= 20;
}

/** Best-effort: a dueDate string that parses to a past date is "overdue". */
function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const t = Date.parse(dueDate);
  return !Number.isNaN(t) && t < Date.now();
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function row(task: string, meetingTitle: string, owner: string | null, priority: string | null, overdue: boolean): string {
  const pill = (text: string, bg: string, color: string) =>
    `<span style="display:inline-block;font-size:11px;font-weight:600;background:${bg};color:${color};padding:2px 8px;border-radius:999px;margin-left:6px;">${text}</span>`;
  const prio = priority ? pill(priority, "#eef2f7", "#475569") : "";
  const flag = overdue ? pill("OVERDUE", "#fde8e8", "#b42318") : "";
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #eef2f7;">
    <div style="font-size:14px;color:#1e293b;">${escape(task)}${flag}${prio}</div>
    <div style="font-size:12px;color:#94a3b8;margin-top:2px;">${owner ? escape(owner) + " · " : ""}${escape(meetingTitle)}</div>
  </td></tr>`;
}

export interface Digest {
  subject: string;
  html: string;
  openCount: number;
  overdueCount: number;
}

/** Build the digest for an org, or null if there's nothing open to send. */
export async function buildActionItemDigest(orgId: string, greetingName?: string): Promise<Digest | null> {
  const items = await prisma.actionItem.findMany({
    where: { orgId, completed: false },
    include: { meeting: { select: { title: true } } },
    take: 100,
  });
  if (items.length === 0) return null;

  const sorted = items
    .map((i) => ({ ...i, overdue: isOverdue(i.dueDate) }))
    .sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return (PRIORITY_RANK[a.priority ?? ""] ?? 3) - (PRIORITY_RANK[b.priority ?? ""] ?? 3);
    });

  const overdueCount = sorted.filter((i) => i.overdue).length;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const rows = sorted.map((i) => row(i.task, i.meeting.title, i.owner, i.priority, i.overdue)).join("");

  const subject =
    overdueCount > 0
      ? `${overdueCount} overdue · ${sorted.length} open action items`
      : `${sorted.length} open action items`;

  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:#0a1628;border-radius:14px;padding:22px 24px;color:#fff;">
      <div style="font-size:20px;font-weight:800;">CLAR<span style="color:#00c8b4">IX</span></div>
      <div style="font-size:14px;color:rgba(255,255,255,.7);margin-top:6px;">
        ${greetingName ? escape(greetingName) + ", here's" : "Here's"} what's still open across your meetings.
      </div>
    </div>
    <div style="padding:8px 4px;">
      <div style="display:flex;gap:18px;margin:18px 4px;">
        <div><span style="font-size:24px;font-weight:800;color:#0a1628;">${sorted.length}</span>
          <span style="font-size:13px;color:#64748b;"> open</span></div>
        ${overdueCount > 0 ? `<div><span style="font-size:24px;font-weight:800;color:#b42318;">${overdueCount}</span><span style="font-size:13px;color:#64748b;"> overdue</span></div>` : ""}
      </div>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      <div style="margin-top:22px;">
        <a href="${base}/action-items" style="display:inline-block;background:#00c8b4;color:#04211d;font-weight:700;font-size:14px;text-decoration:none;padding:11px 20px;border-radius:11px;">Open action items →</a>
      </div>
      <p style="font-size:12px;color:#94a3b8;margin-top:24px;">You're receiving this because action-item digests are on. Turn them off in Settings.</p>
    </div>
  </div>`;

  return { subject, html, openCount: sorted.length, overdueCount };
}
