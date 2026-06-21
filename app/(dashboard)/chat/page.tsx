import { GlobalChatClient } from "@/components/chat/GlobalChatClient";
import { PlanLockedChat } from "@/components/chat/PlanLockedChat";
import { getOrCreateContext, hasDb } from "@/lib/auth";
import { getOrgPlan, globalChatLimit } from "@/lib/plan";
import { getChatUsage } from "@/lib/globalChat";

export const metadata = { title: "CLARIX AI" };
export const dynamic = "force-dynamic";

export default async function ChatPage() {
  if (!hasDb) return <PlanLockedChat />;
  const ctx = await getOrCreateContext();
  if (!ctx) return <PlanLockedChat />;

  const plan = await getOrgPlan(ctx.orgId);
  const limit = globalChatLimit(plan);
  if (limit === 0) return <PlanLockedChat />;

  const usage = await getChatUsage(ctx.userId);
  return <GlobalChatClient usageThisMonth={usage} usageLimit={limit} />;
}
