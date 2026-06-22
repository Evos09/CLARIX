import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { isGoogleConfigured, googleAuthUrl } from "@/lib/google";

export async function GET() {
  if (!isGoogleConfigured()) {
    return NextResponse.json({ error: "Google integration not configured" }, { status: 503 });
  }
  const state = crypto.randomBytes(16).toString("hex");
  (await cookies()).set("clarix_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return NextResponse.redirect(googleAuthUrl(state));
}
