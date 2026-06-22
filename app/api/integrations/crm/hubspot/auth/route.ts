import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { isHubSpotConfigured, hubspotAuthUrl } from "@/lib/crm/hubspot";

export async function GET() {
  if (!isHubSpotConfigured()) return NextResponse.json({ error: "HubSpot not configured" }, { status: 503 });
  const state = crypto.randomBytes(16).toString("hex");
  (await cookies()).set("clarix_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  return NextResponse.redirect(hubspotAuthUrl(state));
}
