import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { isSlackConfigured } from "@/lib/push/slack";

export async function GET() {
  if (!isSlackConfigured()) return NextResponse.json({ error: "Slack not configured" }, { status: 503 });
  const state = crypto.randomBytes(16).toString("hex");
  (await cookies()).set("clarix_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const p = new URLSearchParams({ client_id: process.env.SLACK_CLIENT_ID ?? "", scope: "chat:write,channels:read,groups:read", redirect_uri: `${base}/api/integrations/slack/callback`, state });
  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${p.toString()}`);
}
