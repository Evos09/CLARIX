import { NextResponse } from "next/server";
import { getOrCreateContext } from "@/lib/auth";
import { isAssemblyConfigured } from "@/lib/assemblyai";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (!isAssemblyConfigured()) return NextResponse.json({ error: "Transcription not configured" }, { status: 503 });
  try {
    const res = await fetch("https://streaming.assemblyai.com/v3/token?expires_in_seconds=120", {
      headers: { Authorization: process.env.ASSEMBLYAI_API_KEY ?? "" },
    });
    const d = await res.json();
    if (!res.ok) return NextResponse.json({ error: d.error ?? "Token failed" }, { status: 500 });
    return NextResponse.json({ token: d.token });
  } catch {
    return NextResponse.json({ error: "Token failed" }, { status: 500 });
  }
}
