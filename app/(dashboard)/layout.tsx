import { Sidebar } from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import type { PlanId } from "@/lib/stripe";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let plan: PlanId = "FREE";
  let openActions = 0;
  let meetingsThisMonth = 0;
  if (hasDb) {
    const ctx = await getOrCreateContext();
    if (ctx) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
      if (org) plan = org.plan as PlanId;
      [openActions, meetingsThisMonth] = await Promise.all([
        prisma.actionItem.count({ where: { orgId: ctx.orgId, completed: false } }),
        prisma.meeting.count({ where: { orgId: ctx.orgId, createdAt: { gte: monthStart } } }),
      ]);
    }
  }
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar plan={plan} openActions={openActions} meetingsThisMonth={meetingsThisMonth} />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
