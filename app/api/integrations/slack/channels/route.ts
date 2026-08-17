import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";
import { listSlackChannels } from "@/lib/push/slack";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const conn = await prisma.slackConnection.findUnique({ where: { userId: ctx.userId } });
  if (!conn) return NextResponse.json({ error: "Not connected" }, { status: 409 });
  try {
    return NextResponse.json(await listSlackChannels(decryptToken(conn.accessToken)));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
