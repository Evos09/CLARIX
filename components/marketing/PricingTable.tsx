import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS, type PlanId } from "@/lib/stripe";
import { cn } from "@/lib/utils";

const FEATURES: Record<PlanId, string[]> = {
  FREE: ["10 meetings / month", "General meeting type", "Summary + action items"],
  STARTER: ["20 meetings / month", "All General meeting types", "PDF export"],
  PRO: ["Unlimited meetings", "All standard meeting types", "PDF, DOCX, CSV & JSON export", "Ask CLARIX chat"],
  ENTERPRISE: ["Everything in Pro", "Pro Verticals (Health/Legal/Finance)", "SSO + custom templates", "EHR / FHIR export"],
};

const ORDER: PlanId[] = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

export function PricingTable({ highlight = "PRO" }: { highlight?: PlanId }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {ORDER.map((id) => {
        const plan = PLANS[id];
        const featured = id === highlight;
        return (
          <Card key={id} className={cn(featured && "border-teal ring-2 ring-teal/30")}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {featured && (
                  <span className="rounded-full bg-teal px-2 py-0.5 text-xs font-semibold text-white">
                    Popular
                  </span>
                )}
              </CardTitle>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                ${plan.price}
                <span className="text-sm font-normal text-muted-foreground">/user/mo</span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {FEATURES[id].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-teal-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
