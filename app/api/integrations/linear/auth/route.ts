import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { isLinearConfigured } from "@/lib/push/linear";

export async function GET() {
  if (!isLinearConfigured()) return NextResponse.json({ error: "Linear not configured" }, { status: 503 });
  const state = crypto.randomBytes(16).toString("hex");
  (await cookies()).set("clarix_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const p = new URLSearchParams({ client_id: process.env.LINEAR_CLIENT_ID ?? "", redirect_uri: `${base}/api/integrations/linear/callback`, response_type: "code", scope: "issues:create,read", state });
  return NextResponse.redirect(`https://linear.app/oauth/authorize?${p.toString()}`);
}
