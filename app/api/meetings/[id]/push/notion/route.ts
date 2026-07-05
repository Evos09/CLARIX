import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";
import { pushToNotion, searchNotionParent } from "@/lib/push/notion";
import type { BaseOutput } from "@/lib/outputTypes";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const conn = await prisma.notionConnection.findUnique({ where: { userId: ctx.userId } });
  if (!conn) return NextResponse.json({ error: "Connect Notion in Settings first." }, { status: 409 });
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const output = (meeting.structuredOutput as unknown as BaseOutput | null) ?? null;
  if (!output) return NextResponse.json({ error: "No analysis to push yet." }, { status: 409 });

  const body = (await req.json().catch(() => ({}))) as { pageId?: string };
  const token = decryptToken(conn.accessToken);
  try {
    const parentId = body.pageId ?? conn.parentPageId ?? (await searchNotionParent(token));
    if (!parentId) return NextResponse.json({ error: "Share a Notion page with CLARIX first." }, { status: 409 });
    const pageUrl = await pushToNotion(token, parentId, meeting.title, output);
    await prisma.integrationPush.create({ data: { meetingId: id, userId: ctx.userId, platform: "NOTION", destination: conn.workspaceName, externalUrl: pageUrl } });
    return NextResponse.json({ success: true, pageUrl });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Push failed" }, { status: 500 });
  }
}
