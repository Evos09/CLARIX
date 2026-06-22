import type { BaseOutput } from "@/lib/outputTypes";

export function isNotionConfigured(): boolean {
  return Boolean(process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET);
}

const H = (token: string) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json", "Notion-Version": "2022-06-28" });

export async function searchNotionParent(token: string): Promise<string | null> {
  const res = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: H(token),
    body: JSON.stringify({ filter: { property: "object", value: "page" }, page_size: 1 }),
  });
  const d = await res.json();
  return d.results?.[0]?.id ?? null;
}

export async function pushToNotion(token: string, parentPageId: string, title: string, output: BaseOutput): Promise<string> {
  const heading = (t: string) => ({ object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: t } }] } });
  const para = (t: string) => ({ object: "block", type: "paragraph", paragraph: { rich_text: [{ text: { content: t.slice(0, 1900) } }] } });
  const todo = (t: string) => ({ object: "block", type: "to_do", to_do: { rich_text: [{ text: { content: t.slice(0, 1900) } }], checked: false } });
  const bullet = (t: string) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ text: { content: t.slice(0, 1900) } }] } });

  const children = [
    heading("Summary"), para(output.tldr ?? ""),
    heading("Action Items"), ...(output.actionItems ?? []).map((a) => todo(`${a.task}${a.owner ? ` — ${a.owner}` : ""}`)),
    heading("Key Decisions"), ...(output.keyDecisions ?? []).map((d) => bullet(d)),
  ];

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: H(token),
    body: JSON.stringify({ parent: { page_id: parentPageId }, properties: { title: { title: [{ text: { content: title } }] } }, children }),
  });
  const d = await res.json();
  if (!d.id) throw new Error(d.message ?? "Notion create failed");
  return d.url ?? "";
}
