import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { encryptToken } from "@/lib/crypto";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const saved = (await cookies()).get("clarix_oauth_state")?.value;
  if (!code || state !== saved) return NextResponse.redirect(`${base}/settings?error=oauth`);
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.redirect(`${base}/settings?error=auth`);
  try {
    const auth = Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString("base64");
    const res = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "authorization_code", code, redirect_uri: `${base}/api/integrations/notion/callback` }),
    });
    const d = await res.json();
    if (!d.access_token) throw new Error("token");
    await prisma.notionConnection.upsert({
      where: { userId: ctx.userId },
      update: { accessToken: encryptToken(d.access_token), workspaceName: d.workspace_name ?? "", workspaceId: d.workspace_id ?? "", connected: true },
      create: { userId: ctx.userId, accessToken: encryptToken(d.access_token), workspaceName: d.workspace_name ?? "", workspaceId: d.workspace_id ?? "" },
    });
    return NextResponse.redirect(`${base}/settings?connected=notion`);
  } catch {
    return NextResponse.redirect(`${base}/settings?error=oauth`);
  }
}
