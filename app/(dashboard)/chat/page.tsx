import { GlobalChatClient } from "@/components/chat/GlobalChatClient";
import { PlanLockedChat } from "@/components/chat/PlanLockedChat";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import { canSendGlobalChat, getOrgPlan, globalChatLimit } from "@/lib/plan";
import { getChatBonus, getChatUsage } from "@/lib/globalChat";

export const metadata = { title: "Clarix Chat" };
export const dynamic = "force-dynamic";

export default async function ChatPage() {
  if (!hasDb) return <PlanLockedChat />;
  const ctx = await getOrCreateContext();
  if (!ctx) return <PlanLockedChat />;

  const plan = await getOrgPlan(ctx.orgId);
  const limit = globalChatLimit(plan);
  const canSend = canSendGlobalChat(plan);

  // A Free workspace can't compose here, but it can ask questions in the
  // overlay — and those threads live in this same store. Show the upgrade wall
  // only when there is genuinely nothing to read; once a user has history,
  // hiding it would be paywalling their own words back to them. They can read
  // it; the composer stays disabled.
  if (!canSend) {
    const existing = await prisma.globalChatSession.count({ where: { userId: ctx.userId } });
    if (existing === 0) return <PlanLockedChat />;
  }

  const [usage, bonus] = await Promise.all([getChatUsage(ctx.userId), getChatBonus(ctx.userId)]);
  // Effective cap = plan allowance + any purchased packs; null = unlimited (and
  // for a read-only Free view there is no send budget worth showing).
  const effectiveLimit = limit === null || limit === 0 ? null : limit + bonus;
  return <GlobalChatClient usageThisMonth={usage} usageLimit={effectiveLimit} canSend={canSend} />;
}
