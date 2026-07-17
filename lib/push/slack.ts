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
  // A bot can only post to channels it belongs to. Public channels can be
  // auto-joined (needs the channels:join scope); private channels must be
  // invited manually with /invite. Best-effort: ignore join errors and let
  // the postMessage call surface the real problem.
  await fetch("https://slack.com/api/conversations.join", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ channel: channelId }),
  }).catch(() => {});

  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ channel: channelId, blocks, text: title }),
  });
  const d = await res.json();
  if (!d.ok) {
    if (d.error === "not_in_channel" || d.error === "channel_not_found") {
      throw new Error("CLARIX isn't in that channel. In Slack, run /invite @CLARIX in the channel, then try again.");
    }
    throw new Error(d.error ?? "Slack post failed");
  }
}
