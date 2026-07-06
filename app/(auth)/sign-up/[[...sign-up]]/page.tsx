"use client";

import Link from "next/link";
import { SignUp, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2, ShieldCheck, Check } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerkAppearance";
import { buttonVariants } from "@/components/ui/button";
import { useState } from "react";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function SignUpPage() {
  const [accepted, setAccepted] = useState(false);

  return (
    <AuthShell mode="sign-up">
      {hasClerk ? (
        <div className="flex flex-col items-center gap-6 w-full">
          {!accepted ? (
            <div className="w-full max-w-[400px] bg-card border border-border p-6 rounded-2xl shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-violet-100 p-2 text-violet-700">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Terms & Privacy Agreement</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">Please review and accept to continue</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Before creating your Clarix account, please review and agree to our official regulatory disclosures:
                </p>
                <ul className="list-disc pl-4 space-y-1.5 font-medium">
                  <li>
                    <Link href="/privacy" target="_blank" className="underline text-violet-600 hover:text-violet-700">
                      Privacy Policy
                    </Link>{" "}
                    (describes data collections & encryption safeguards)
                  </li>
                  <li>
                    <Link href="/terms" target="_blank" className="underline text-violet-600 hover:text-violet-700">
                      Terms of Service
                    </Link>{" "}
                    (includes binding arbitration and class waivers)
                  </li>
                </ul>
                <p className="text-[10px] bg-muted/60 rounded p-2 text-zinc-500 font-medium">
                  ⚖️ <strong>Recording Notice:</strong> You represent that you will obtain all legally required consents from meeting participants before recording.{" "}
                  <Link href="/legal/recording-consent" target="_blank" className="underline text-violet-600 hover:text-violet-700">
                    Learn more →
                  </Link>
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setAccepted(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="size-4" /> I Agree & Accept Terms
                </button>
              </div>
            </div>
          ) : (
            <>
              <ClerkLoading>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-teal-600" /> Loading secure sign-up…
                </div>
              </ClerkLoading>
              <ClerkLoaded>
                <div className="flex flex-col items-center gap-4 w-full animate-in fade-in duration-300">
                  <SignUp appearance={clerkAppearance} forceRedirectUrl="/dashboard" signInUrl="/sign-in" />
                  <button 
                    onClick={() => setAccepted(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
                  >
                    Review Privacy Policy & Disclosures
                  </button>
                </div>
              </ClerkLoaded>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add your Clerk keys to <code className="font-mono">.env</code> to enable sign-up. You can
            still explore the product in development.
          </p>
          <Link href="/dashboard" className={buttonVariants({ variant: "accent" })}>
            Try the dashboard flow
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
