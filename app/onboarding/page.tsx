"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { USE_CASES } from "@/lib/meetingTypes";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function finish() {
    setSubmitting(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName: orgName || "My Organization", useCase: useCase || "OTHER" }),
      });
    } catch {
      // best-effort in demo mode
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className={cn("h-1.5 w-8 rounded-full", i <= step ? "bg-teal" : "bg-muted")} />
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-semibold">Welcome to CLARIX</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Every meeting. Captured. Understood. Done. Let&apos;s set up your workspace.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgName">Name your organization</Label>
                  <Input id="orgName" placeholder="Acme Inc." value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <Button className="w-full" variant="accent" onClick={() => setStep(1)} disabled={!orgName.trim()}>
                  Continue
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-semibold">What&apos;s your primary use case?</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This just tailors your default meeting type suggestions. You can change it anytime.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {USE_CASES.map((uc) => (
                    <button
                      key={uc.id}
                      onClick={() => setUseCase(uc.id)}
                      className={cn(
                        "rounded-lg border p-4 text-left text-sm font-medium transition-colors",
                        useCase === uc.id ? "border-teal bg-teal/10 text-foreground" : "border-border hover:bg-muted",
                      )}
                    >
                      {uc.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                  <Button className="flex-1" variant="accent" onClick={() => setStep(2)} disabled={!useCase}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-full bg-teal/15 text-teal-600">
                  <Check className="size-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">You&apos;re all set</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {orgName || "Your workspace"} is ready. Upload your first meeting and watch CLARIX go to work.
                  </p>
                </div>
                <Button className="w-full" variant="accent" onClick={finish} disabled={submitting}>
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : "Go to dashboard"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
