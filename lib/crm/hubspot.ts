import type { BaseOutput } from "@/lib/outputTypes";

const AUTH = "https://app.hubspot.com/oauth/authorize";
const TOKEN = "https://api.hubapi.com/oauth/v1/token";
const SCOPES = "oauth crm.objects.contacts.write";

export function isHubSpotConfigured(): boolean {
  return Boolean(process.env.HUBSPOT_CLIENT_ID && process.env.HUBSPOT_CLIENT_SECRET);
}

export function hubspotRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/api/integrations/crm/hubspot/callback`;
}

export function hubspotAuthUrl(state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.HUBSPOT_CLIENT_ID ?? "",
    redirect_uri: hubspotRedirectUri(),
    scope: SCOPES,
    state,
  });
  return `${AUTH}?${p.toString()}`;
}

export interface HsTokens { accessToken: string; refreshToken?: string; expiresAt: Date }

async function tokenReq(body: Record<string, string>): Promise<HsTokens> {
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.HUBSPOT_CLIENT_ID ?? "", client_secret: process.env.HUBSPOT_CLIENT_SECRET ?? "", ...body }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.message ?? "HubSpot token error");
  return { accessToken: d.access_token, refreshToken: d.refresh_token, expiresAt: new Date(Date.now() + (d.expires_in ?? 1800) * 1000) };
}

export function exchangeHubSpotCode(code: string): Promise<HsTokens> {
  return tokenReq({ grant_type: "authorization_code", redirect_uri: hubspotRedirectUri(), code });
}
export function refreshHubSpot(refreshToken: string): Promise<HsTokens> {
  return tokenReq({ grant_type: "refresh_token", refresh_token: refreshToken });
}

const PRIORITY: Record<string, string> = { HIGH: "HIGH", MEDIUM: "MEDIUM", LOW: "LOW" };

export async function pushToHubSpot(accessToken: string, title: string, output: BaseOutput): Promise<{ noteId: string; taskIds: string[] }> {
  const h = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
  const now = Date.now().toString();
  const decisions = (output.keyDecisions ?? []).map((d) => `• ${d}`).join("<br>");
  const body = `<b>${title}</b><br>${output.tldr ?? ""}<br><br><b>Key decisions</b><br>${decisions}`;

  const noteRes = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
    method: "POST",
    headers: h,
    body: JSON.stringify({ properties: { hs_note_body: body, hs_timestamp: now } }),
  });
  const note = await noteRes.json();
  if (!noteRes.ok) throw new Error(note.message ?? "HubSpot note failed");

  const taskIds: string[] = [];
  for (const a of output.actionItems ?? []) {
    if (!a.task) continue;
    const r = await fetch("https://api.hubapi.com/crm/v3/objects/tasks", {
      method: "POST",
      headers: h,
      body: JSON.stringify({ properties: { hs_task_subject: a.task.slice(0, 255), hs_task_status: "NOT_STARTED", hs_task_priority: a.priority ? PRIORITY[a.priority] ?? "MEDIUM" : "MEDIUM", hs_timestamp: now } }),
    });
    const d = await r.json();
    if (r.ok && d.id) taskIds.push(d.id);
  }
  return { noteId: note.id, taskIds };
}
