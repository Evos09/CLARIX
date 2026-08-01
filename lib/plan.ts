import { prisma } from "@/lib/prisma";
import { PLANS, type PlanConfig, type PlanId } from "@/lib/stripe";
import { getMeetingType } from "@/lib/meetingTypes";
import { CLAUDE_HAIKU, CLAUDE_SONNET_5 } from "@/lib/claude";

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
    return { ok: false, reason: "Pro Verticals are available on the Enterprise plan (talk to sales)." };
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
  // Ascending ladder: Free locked, then each tier buys more Clarix Chat.
  // Pro is capped so a single power user can't run up unbounded Claude cost;
  // over the cap they buy a $9/100-message pack or upgrade to Business.
  switch (plan.id) {
    case "FREE": return 0;
    case "STARTER": return 25;
    case "PRO": return 100;
    default: return null; // Business & Enterprise: unlimited
  }
}

/** Messages sold per purchased overage pack, and the pack price in USD. */
export const CHAT_PACK_SIZE = 100;
export const CHAT_PACK_PRICE = 9;

/**
 * Which Claude model powers Clarix Chat for a plan. Pro/Business/Enterprise get
 * Sonnet 5; Free/Starter get Haiku. Purchased packs inherit the plan's model.
 */
export function chatModelForPlan(plan: PlanConfig): string {
  return plan.id === "PRO" || plan.id === "BUSINESS" || plan.id === "ENTERPRISE"
    ? CLAUDE_SONNET_5
    : CLAUDE_HAIKU;
}

/**
 * The meeting-memory overlay is a desktop-app perk on every paid plan
 * (Starter and up); Free is excluded. Usage is still metered by
 * globalChatLimit, so Starter's 25 messages/month cap applies here too.
 */
export function overlayAllowed(plan: PlanConfig): boolean {
  return plan.id !== "FREE";
}

/** Per-file upload ceiling in bytes (override with NEXT_PUBLIC_MAX_UPLOAD_MB). */
export function maxUploadBytes(): number {
  const mb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB) || 2048;
  return mb * 1024 * 1024;
}

/** Total audio bytes an org has stored. */
export async function orgStorageUsed(orgId: string): Promise<number> {
  const agg = await prisma.meeting.aggregate({ where: { orgId }, _sum: { audioSize: true } });
  return agg._sum.audioSize ?? 0;
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
