import { NextResponse } from "next/server";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { isAssemblyConfigured } from "@/lib/assemblyai";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  if (!isAssemblyConfigured()) return NextResponse.json({ error: "Transcription not configured" }, { status: 503 });
  try {
    const res = await fetch("https://streaming.assemblyai.com/v3/token?expires_in_seconds=120", {
      headers: { Authorization: process.env.ASSEMBLYAI_API_KEY ?? "" },
    });
    const d = await res.json();
    if (!res.ok) return NextResponse.json({ error: d.error ?? "Token failed" }, { status: 500 });

    // Bias live captions toward the org's custom vocabulary (teammate names,
    // product acronyms) — the same terms the recording bot already uses.
    // Best-effort: a vocabulary lookup failure must never block getting a token.
    let keyterms: string[] = [];
    try {
      const org = await prisma.organization.findUnique({
        where: { id: ctx.orgId },
        select: { customVocabulary: true },
      });
      keyterms = org?.customVocabulary ?? [];
    } catch {
      /* leave keyterms empty */
    }

    return NextResponse.json({ token: d.token, keyterms });
  } catch {
    return NextResponse.json({ error: "Token failed" }, { status: 500 });
  }
}
