import { GlobalChatClient } from "@/components/chat/GlobalChatClient";
import { PlanLockedChat } from "@/components/chat/PlanLockedChat";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import { getOrgPlan, globalChatLimit } from "@/lib/plan";
import { getChatBonus, getChatUsage } from "@/lib/globalChat";

export const metadata = { title: "Clarix Chat" };
export const dynamic = "force-dynamic";

export default async function ChatPage() {
  if (!hasDb) return <PlanLockedChat />;
  const ctx = await getOrCreateContext();
  if (!ctx) return <PlanLockedChat />;

  const plan = await getOrgPlan(ctx.orgId);
  const limit = globalChatLimit(plan);
  if (limit === 0) return <PlanLockedChat />;

  const [usage, bonus] = await Promise.all([getChatUsage(ctx.userId), getChatBonus(ctx.userId)]);
  // Show the effective cap (plan allowance + any purchased packs); null = unlimited.
  const effectiveLimit = limit === null ? null : limit + bonus;
  return <GlobalChatClient usageThisMonth={usage} usageLimit={effectiveLimit} />;
}
