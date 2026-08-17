import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";

const Body = z.object({ name: z.string().min(1).max(120) });

export async function PATCH(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const org = await prisma.organization.update({ where: { id: ctx.orgId }, data: { name: parsed.data.name } });
  return NextResponse.json({ ok: true, name: org.name });
}
