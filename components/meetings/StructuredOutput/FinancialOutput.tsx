import { TrendingUp, ShieldAlert, Award, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Recommendation {
  product: string;
  rationale: string;
  suitabilityFlag?: boolean;
}

interface FinancialOutputProps {
  meetingId: string;
  output: {
    clientSummary?: string;
    investmentGoals?: string[];
    riskTolerance?: string;
    recommendations?: Recommendation[];
    disclosuresGiven?: string[];
    complianceFlags?: string[];
    nextReviewDate?: string;
  };
  isDemo?: boolean;
}

export function FinancialOutput({ output }: FinancialOutputProps) {
  const summary = output.clientSummary ?? "";
  const goals = output.investmentGoals ?? [];
  const risk = output.riskTolerance ?? "";
  const recommendations = output.recommendations ?? [];
  const disclosures = output.disclosuresGiven ?? [];
  const compliance = output.complianceFlags ?? [];

  // Determine styling for risk level
  const riskNormalized = risk.toLowerCase();
  const isHigh = riskNormalized.includes("high") || riskNormalized.includes("aggressive");
  const isMed = riskNormalized.includes("medium") || riskNormalized.includes("moderate");
  const isLow = riskNormalized.includes("low") || riskNormalized.includes("conservative");

  return (
    <div className="space-y-6">
      {/* Risk and Summary Top Panel */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Client Advisory Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {summary || "No client summary parsed from session."}
            </p>
          </CardContent>
        </Card>

        {/* Risk Tolerance Gauge */}
        <Card className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <TrendingUp className="size-8 text-violet-600" />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assessed Risk Profile
            </p>
            <span
              className={cn(
                "inline-block rounded-full px-4 py-1.5 text-sm font-bold tracking-wide uppercase",
                isHigh && "bg-red-50 text-red-700 border border-red-200",
                isMed && "bg-amber-50 text-amber-800 border border-amber-200",
                isLow && "bg-green-50 text-green-700 border border-green-200",
                !isHigh && !isMed && !isLow && "bg-muted text-muted-foreground border border-border"
              )}
            >
              {risk || "Not Stated"}
            </span>
          </div>
        </Card>
      </div>

      {/* Investment Goals */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Award className="size-4 text-violet-600" />
              Primary Investment Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {goals.map((goal, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-md border border-border bg-card p-3">
                  <span className="text-violet-600 font-bold font-mono text-sm leading-none mt-0.5">
                    {idx + 1}.
                  </span>
                  <span className="text-sm text-foreground/90 font-medium">{goal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations with Suitability */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Investment & Product Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-muted/25 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-bold text-foreground">
                    {rec.product}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-semibold border",
                      rec.suitabilityFlag !== false
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {rec.suitabilityFlag !== false ? "Suitable (Passed)" : "Unsuitable / Flagged"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{rec.rationale}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Compliance Scorecard & Warnings */}
      <div className="grid gap-6 md:grid-cols-2">
        {disclosures.length > 0 && (
          <Card className="border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-green-700">
                Disclosures & Affirmations Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm divide-y divide-border/40">
                {disclosures.map((disc, idx) => (
                  <li key={idx} className="pt-2 flex items-center gap-2 first:pt-0">
                    <span className="text-green-600 text-xs font-bold font-mono">✓</span>
                    <span className="text-foreground/90">{disc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {compliance.length > 0 && (
          <Card className="border-t-4 border-t-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                <ShieldAlert className="size-4" /> Compliance Violations / Risks Flagged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {compliance.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="size-2 rounded-full bg-destructive mt-1.5 shrink-0" />
                    <span className="text-destructive font-semibold leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review date */}
      {output.nextReviewDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
          <Calendar className="size-4 text-violet-500" />
          <span>Scheduled Next Portfolio Review: <strong>{output.nextReviewDate}</strong></span>
        </div>
      )}
    </div>
  );
}
