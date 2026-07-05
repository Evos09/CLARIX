import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const Body = z.object({
  completed: z.boolean().optional(),
  owner: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  priority: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const existing = await prisma.actionItem.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.actionItem.update({
    where: { id },
    data: {
      ...(parsed.data.completed !== undefined ? { completed: parsed.data.completed } : {}),
      ...(parsed.data.owner !== undefined ? { owner: parsed.data.owner } : {}),
      ...(parsed.data.dueDate !== undefined ? { dueDate: parsed.data.dueDate } : {}),
      ...(parsed.data.priority !== undefined ? { priority: parsed.data.priority } : {}),
    },
  });
  return NextResponse.json(updated);
}
