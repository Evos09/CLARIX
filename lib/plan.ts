import { prisma } from "@/lib/prisma";
import { PLANS, type PlanConfig, type PlanId } from "@/lib/stripe";
import { getMeetingType } from "@/lib/meetingTypes";

export async function getOrgPlan(orgId: string): Promise<PlanConfig> {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  return PLANS[(org?.plan as PlanId) ?? "FREE"];
}

export async function canCreateMeeting(orgId: string): Promise<{ ok: boolean; reason?: string }> {
  const plan = await getOrgPlan(orgId);
  if (plan.meetingsPerMonth === null) return { ok: true };
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const count = await prisma.meeting.count({ where: { orgId, createdAt: { gte: monthStart } } });
  if (count >= plan.meetingsPerMonth) {
    return { ok: false, reason: `Monthly limit of ${plan.meetingsPerMonth} meetings reached on the ${plan.name} plan.` };
  }
  return { ok: true };
}

export function canUseType(plan: PlanConfig, typeId: string): { ok: boolean; reason?: string } {
  const t = getMeetingType(typeId);
  if (t.category === "PRO" && !plan.proVerticals) {
    return { ok: false, reason: "Pro Verticals require the Enterprise plan." };
  }
  if (!plan.allMeetingTypes && typeId !== "GENERAL") {
    return { ok: false, reason: "Your plan only supports General meetings. Upgrade for all meeting types." };
  }
  return { ok: true };
}

export function canExportFormat(plan: PlanConfig, format: string): boolean {
  return (plan.exports as string[]).includes(format);
}

/** Monthly global-chat message cap. null = unlimited, 0 = locked. */
export function globalChatLimit(plan: PlanConfig): number | null {
  if (plan.id === "ENTERPRISE") return null;
  if (plan.id === "PRO") return 200;
  return 0;
}

/** Audio storage cap in bytes. null = unlimited. */
export function storageLimitBytes(plan: PlanConfig): number | null {
  switch (plan.id) {
    case "FREE": return 500 * 1024 * 1024;
    case "STARTER": return 5 * 1024 * 1024 * 1024;
    case "PRO": return 50 * 1024 * 1024 * 1024;
    default: return null;
  }
}
