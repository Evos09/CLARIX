import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { isSlackConfigured } from "@/lib/push/slack";
import { isNotionConfigured } from "@/lib/push/notion";
import { isLinearConfigured } from "@/lib/push/linear";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const [slack, notion, linear] = await Promise.all([
    prisma.slackConnection.findUnique({ where: { userId: ctx.userId }, select: { teamName: true, connected: true } }),
    prisma.notionConnection.findUnique({ where: { userId: ctx.userId }, select: { workspaceName: true, connected: true } }),
    prisma.linearConnection.findUnique({ where: { userId: ctx.userId }, select: { organizationName: true, connected: true } }),
  ]);
  return NextResponse.json({
    configured: { slack: isSlackConfigured(), notion: isNotionConfigured(), linear: isLinearConfigured() },
    slack,
    notion,
    linear,
  });
}

export async function DELETE(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const platform = new URL(req.url).searchParams.get("platform");
  if (platform === "slack") await prisma.slackConnection.deleteMany({ where: { userId: ctx.userId } });
  else if (platform === "notion") await prisma.notionConnection.deleteMany({ where: { userId: ctx.userId } });
  else if (platform === "linear") await prisma.linearConnection.deleteMany({ where: { userId: ctx.userId } });
  else return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
  return NextResponse.json({ disconnected: true });
}
