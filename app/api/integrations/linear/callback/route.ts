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
    const res = await fetch("https://api.linear.app/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, redirect_uri: `${base}/api/integrations/linear/callback`, client_id: process.env.LINEAR_CLIENT_ID ?? "", client_secret: process.env.LINEAR_CLIENT_SECRET ?? "", grant_type: "authorization_code" }),
    });
    const d = await res.json();
    if (!d.access_token) throw new Error("token");
    const org = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: { Authorization: d.access_token, "Content-Type": "application/json" },
      body: JSON.stringify({ query: "query { organization { id name } }" }),
    }).then((r) => r.json()).catch(() => null);
    await prisma.linearConnection.upsert({
      where: { userId: ctx.userId },
      update: { accessToken: encryptToken(d.access_token), organizationId: org?.data?.organization?.id ?? "", organizationName: org?.data?.organization?.name ?? "", connected: true },
      create: { userId: ctx.userId, accessToken: encryptToken(d.access_token), organizationId: org?.data?.organization?.id ?? "", organizationName: org?.data?.organization?.name ?? "" },
    });
    return NextResponse.redirect(`${base}/settings?connected=linear`);
  } catch {
    return NextResponse.redirect(`${base}/settings?error=oauth`);
  }
}
