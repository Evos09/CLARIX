import type { BaseOutput } from "@/lib/outputTypes";

export function isLinearConfigured(): boolean {
  return Boolean(process.env.LINEAR_CLIENT_ID && process.env.LINEAR_CLIENT_SECRET);
}

async function gql(token: string, query: string, variables: Record<string, unknown>) {
  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const d = await res.json();
  if (d.errors) throw new Error(d.errors[0]?.message ?? "Linear error");
  return d.data;
}

export async function listLinearTeams(token: string): Promise<{ id: string; name: string }[]> {
  const d = await gql(token, `query { teams { nodes { id name } } }`, {});
  return d.teams.nodes;
}

const PRIORITY: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };

export async function pushToLinear(token: string, teamId: string, title: string, url: string, output: BaseOutput): Promise<number> {
  const items = output.actionItems ?? [];
  let created = 0;
  for (const a of items) {
    if (!a.task) continue;
    await gql(
      token,
      `mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success } }`,
      {
        input: {
          teamId,
          title: a.task.slice(0, 250),
          description: `From CLARIX meeting: ${title}\n${url}\n\nContext: ${output.tldr ?? ""}`,
          priority: a.priority ? PRIORITY[a.priority] ?? 0 : 0,
        },
      },
    );
    created++;
  }
  return created;
}
