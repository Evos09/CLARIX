import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const members = await prisma.user.findMany({
    where: { orgId: ctx.orgId },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(members);
}
