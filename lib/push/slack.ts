import type { BaseOutput } from "@/lib/outputTypes";

export function isSlackConfigured(): boolean {
  return Boolean(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET);
}

export async function listSlackChannels(token: string): Promise<{ id: string; name: string }[]> {
  const res = await fetch("https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = await res.json();
  if (!d.ok) throw new Error(d.error ?? "Slack error");
  return (d.channels ?? []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }));
}

export async function pushToSlack(token: string, channelId: string, title: string, url: string, output: BaseOutput): Promise<void> {
  const actions = (output.actionItems ?? []).map((a) => `• ${a.task}${a.owner ? ` — ${a.owner}` : ""}${a.dueDate ? ` (due ${a.dueDate})` : ""}`).join("\n") || "None";
  const decisions = (output.keyDecisions ?? []).map((d) => `• ${d}`).join("\n") || "None";
  const blocks = [
    { type: "header", text: { type: "plain_text", text: `📋 ${title}` } },
    { type: "section", text: { type: "mrkdwn", text: output.tldr ?? "" } },
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: `*Action Items*\n${actions}` } },
    { type: "section", text: { type: "mrkdwn", text: `*Key Decisions*\n${decisions}` } },
    { type: "context", elements: [{ type: "mrkdwn", text: `<${url}|View full summary in CLARIX →>` }] },
  ];
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ channel: channelId, blocks, text: title }),
  });
  const d = await res.json();
  if (!d.ok) throw new Error(d.error ?? "Slack post failed");
}
