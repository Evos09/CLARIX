import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { isNotionConfigured } from "@/lib/push/notion";

export async function GET() {
  if (!isNotionConfigured()) return NextResponse.json({ error: "Notion not configured" }, { status: 503 });
  const state = crypto.randomBytes(16).toString("hex");
  (await cookies()).set("clarix_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const p = new URLSearchParams({ client_id: process.env.NOTION_CLIENT_ID ?? "", response_type: "code", owner: "user", redirect_uri: `${base}/api/integrations/notion/callback`, state });
  return NextResponse.redirect(`https://api.notion.com/v1/oauth/authorize?${p.toString()}`);
}
