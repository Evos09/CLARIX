import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getSupabaseAdmin, AUDIO_BUCKET, isSupabaseConfigured } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };
const Body = z.object({ title: z.string().min(1).max(200).optional() });

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const updated = await prisma.meeting.update({ where: { id }, data: { title: parsed.data.title } });
  return NextResponse.json({ ok: true, title: updated.title });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (meeting.storagePath && isSupabaseConfigured()) {
    try { await getSupabaseAdmin().storage.from(AUDIO_BUCKET).remove([meeting.storagePath]); } catch { /* best-effort */ }
  }
  await prisma.meeting.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
