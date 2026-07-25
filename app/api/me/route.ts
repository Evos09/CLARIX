import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getOrgPlan } from "@/lib/plan";

/**
 * Lightweight identity endpoint for non-web clients (Chrome extension, Tauri
 * desktop). A client sends its Clerk session token as `Authorization: Bearer`;
 * this validates it and returns who they are + their plan so the client can
 * show limits and gate features. CORS is handled centrally in middleware.
 */
export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const [user, org, plan] = await Promise.all([
    prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { id: true, email: true, name: true, role: true },
    }),
    prisma.organization.findUnique({
      where: { id: ctx.orgId },
      select: { id: true, name: true, plan: true },
    }),
    getOrgPlan(ctx.orgId),
  ]);

  return NextResponse.json({
    user,
    org,
    plan: { id: plan.id, name: plan.name, meetingsPerMonth: plan.meetingsPerMonth },
  });
}
