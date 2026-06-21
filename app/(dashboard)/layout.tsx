import { Sidebar } from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import type { PlanId } from "@/lib/stripe";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let plan: PlanId = "FREE";
  let openActions = 0;
  if (hasDb) {
    const ctx = await getOrCreateContext();
    if (ctx) {
      const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
      if (org) plan = org.plan as PlanId;
      openActions = await prisma.actionItem.count({ where: { orgId: ctx.orgId, completed: false } });
    }
  }
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar plan={plan} openActions={openActions} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
