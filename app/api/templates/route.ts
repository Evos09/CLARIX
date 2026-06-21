import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const templates = await prisma.outputTemplate.findMany({ where: { orgId: ctx.orgId }, orderBy: { name: "asc" } });
  return NextResponse.json(templates);
}

const Body = z.object({
  name: z.string().min(1).max(120),
  meetingType: z.string().min(1),
  promptOverride: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const tpl = await prisma.outputTemplate.create({ data: { ...parsed.data, orgId: ctx.orgId } });
  return NextResponse.json(tpl, { status: 201 });
}

export async function DELETE(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.outputTemplate.deleteMany({ where: { id, orgId: ctx.orgId } });
  return NextResponse.json({ ok: true });
}
