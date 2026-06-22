import type { BaseOutput } from "@/lib/outputTypes";

const AUTH = "https://login.salesforce.com/services/oauth2/authorize";
const TOKEN = "https://login.salesforce.com/services/oauth2/token";

export function isSalesforceConfigured(): boolean {
  return Boolean(process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_CLIENT_SECRET);
}

export function salesforceRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/api/integrations/crm/salesforce/callback`;
}

export function salesforceAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.SALESFORCE_CLIENT_ID ?? "",
    redirect_uri: salesforceRedirectUri(),
    response_type: "code",
    scope: "api refresh_token",
    state,
  });
  return `${AUTH}?${p.toString()}`;
}

export interface SfTokens { accessToken: string; refreshToken?: string; instanceUrl: string; expiresAt: Date }

async function tokenReq(body: Record<string, string>): Promise<SfTokens> {
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.SALESFORCE_CLIENT_ID ?? "", client_secret: process.env.SALESFORCE_CLIENT_SECRET ?? "", ...body }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error_description ?? d.error ?? "Salesforce token error");
  return { accessToken: d.access_token, refreshToken: d.refresh_token, instanceUrl: d.instance_url, expiresAt: new Date(Date.now() + 3600 * 1000) };
}

export function exchangeSalesforceCode(code: string): Promise<SfTokens> {
  return tokenReq({ code, redirect_uri: salesforceRedirectUri(), grant_type: "authorization_code" });
}
export function refreshSalesforce(refreshToken: string): Promise<SfTokens> {
  return tokenReq({ refresh_token: refreshToken, grant_type: "refresh_token" });
}

const PRIORITY: Record<string, string> = { HIGH: "High", MEDIUM: "Normal", LOW: "Low" };

export async function pushToSalesforce(accessToken: string, instanceUrl: string, title: string, output: BaseOutput): Promise<{ activityId: string; taskIds: string[] }> {
  const h = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
  const api = `${instanceUrl}/services/data/v59.0/sobjects`;

  const actRes = await fetch(`${api}/Task`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ Subject: `[CLARIX] ${title}`, Description: output.tldr ?? "", Status: "Completed", Type: "Call" }),
  });
  const act = await actRes.json();
  if (!actRes.ok) throw new Error(act[0]?.message ?? "Salesforce activity failed");

  const taskIds: string[] = [];
  for (const a of output.actionItems ?? []) {
    if (!a.task) continue;
    const r = await fetch(`${api}/Task`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({ Subject: a.task.slice(0, 255), Status: "Not Started", Priority: a.priority ? PRIORITY[a.priority] ?? "Normal" : "Normal", ...(a.dueDate ? { ActivityDate: a.dueDate } : {}) }),
    });
    const d = await r.json();
    if (r.ok && d.id) taskIds.push(d.id);
  }
  return { activityId: act.id, taskIds };
}
