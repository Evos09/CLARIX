import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { isSlackConfigured } from "@/lib/push/slack";
import { isNotionConfigured } from "@/lib/push/notion";
import { isLinearConfigured } from "@/lib/push/linear";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  
  const [slack, notion, linear] = await Promise.all([
    prisma.slackConnection.findUnique({ 
      where: { userId: ctx.userId }, 
      select: { teamName: true, connected: true, autoPostEnabled: true, autoPostChannelId: true } 
    }),
    prisma.notionConnection.findUnique({ 
      where: { userId: ctx.userId }, 
      select: { workspaceName: true, connected: true, parentPageId: true } 
    }),
    prisma.linearConnection.findUnique({ 
      where: { userId: ctx.userId }, 
      select: { organizationName: true, connected: true, defaultTeamId: true } 
    }),
  ]);
  
  return NextResponse.json({
    configured: { slack: isSlackConfigured(), notion: isNotionConfigured(), linear: isLinearConfigured() },
    slack,
    notion,
    linear,
  });
}

export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const body = await req.json().catch(() => null);
  const { platform, autoPostEnabled, autoPostChannelId, parentPageId, defaultTeamId } = body || {};

  if (platform === "slack") {
    const updated = await prisma.slackConnection.update({
      where: { userId: ctx.userId },
      data: {
        autoPostEnabled: Boolean(autoPostEnabled),
        autoPostChannelId: autoPostChannelId ? String(autoPostChannelId).trim() : null,
      },
    });
    return NextResponse.json({ success: true, slack: updated });
  }

  if (platform === "notion") {
    const updated = await prisma.notionConnection.update({
      where: { userId: ctx.userId },
      data: {
        parentPageId: parentPageId ? String(parentPageId).trim() : null,
      },
    });
    return NextResponse.json({ success: true, notion: updated });
  }

  if (platform === "linear") {
    const updated = await prisma.linearConnection.update({
      where: { userId: ctx.userId },
      data: {
        defaultTeamId: defaultTeamId ? String(defaultTeamId).trim() : null,
      },
    });
    return NextResponse.json({ success: true, linear: updated });
  }

  return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
}

export async function DELETE(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const platform = new URL(req.url).searchParams.get("platform");
  if (platform === "slack") await prisma.slackConnection.deleteMany({ where: { userId: ctx.userId } });
  else if (platform === "notion") await prisma.notionConnection.deleteMany({ where: { userId: ctx.userId } });
  else if (platform === "linear") await prisma.linearConnection.deleteMany({ where: { userId: ctx.userId } });
  else return NextResponse.json({ error: "Unknown platform" }, { status: 400 });
  return NextResponse.json({ disconnected: true });
}
