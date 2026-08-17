import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const priority = searchParams.get("priority");
  const completed = searchParams.get("completed");

  const items = await prisma.actionItem.findMany({
    where: {
      orgId: ctx.orgId,
      ...(owner ? { owner } : {}),
      ...(priority ? { priority } : {}),
      ...(completed === "true" ? { completed: true } : completed === "false" ? { completed: false } : {}),
    },
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
    include: { meeting: { select: { id: true, title: true, meetingType: true } } },
  });
  return NextResponse.json(items);
}
