import { Badge } from "@/components/ui/badge";
import { PLANS, type PlanId } from "@/lib/stripe";

const STYLES: Record<PlanId, string> = {
  FREE: "bg-gray-100 text-gray-600 ring-gray-500/20",
  STARTER: "bg-blue-100 text-blue-700 ring-blue-600/20",
  PRO: "bg-teal-100 text-teal-700 ring-teal-600/20",
  BUSINESS: "bg-violet-100 text-violet-700 ring-violet-600/20",
  ENTERPRISE: "bg-amber-100 text-amber-800 ring-amber-600/20",
};

export function PlanBadge({ plan }: { plan: PlanId }) {
  return <Badge className={STYLES[plan]}>{PLANS[plan].name}</Badge>;
}
