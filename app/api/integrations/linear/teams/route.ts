import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";
import { listLinearTeams } from "@/lib/push/linear";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const conn = await prisma.linearConnection.findUnique({ where: { userId: ctx.userId } });
  if (!conn) return NextResponse.json({ error: "Not connected" }, { status: 409 });
  try {
    return NextResponse.json(await listLinearTeams(decryptToken(conn.accessToken)));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
