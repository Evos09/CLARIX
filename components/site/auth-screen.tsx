import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check } from "lucide-react";

export function AuthScreen({
  mode,
}: {
  mode: "login" | "signup";
}) {
  const isSignup = mode === "signup";

  return (
    <main className="relative min-h-screen grid lg:grid-cols-2 noise-overlay">
      {/* Form side */}
      <div className="flex flex-col px-6 sm:px-10 lg:px-16 py-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-auto">
          <span className="grid place-items-center w-7 h-7 rounded-md bg-foreground text-background font-display text-lg leading-none">
            C
          </span>
          <span className="text-2xl font-display">CLARIX</span>
        </Link>

        <div className="w-full max-w-sm mx-auto py-12">
          <h1 className="font-display text-4xl tracking-tight mb-2">
            {isSignup ? "Start Free" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isSignup
              ? "Create your account — no credit card required."
              : "Sign in to your CLARIX account."}
          </p>

          <form className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" placeholder="Jordan Rivera" className="h-12" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" name="email" type="email" placeholder="you@company.com" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" className="h-12" />
            </div>

            <Button className="w-full h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 text-base">
              {isSignup ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            {isSignup ? "Already have an account? " : "New to CLARIX? "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="text-foreground underline underline-offset-4 hover:text-brand transition-colors"
            >
              {isSignup ? "Sign in" : "Start Free"}
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* Brand side */}
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-16">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-background/50">
          <span className="w-8 h-px bg-background/30" />
          The AI meeting assistant
        </div>
        <div>
          <p className="font-display text-4xl leading-tight text-balance mb-8">
            Turn every meeting into action — automatically.
          </p>
          <ul className="space-y-3">
            {[
              "Action items and decisions in minutes",
              "Works for 20+ meeting types, zero setup",
              "14-day Pro trial included",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-background/80">
                <Check className="w-4 h-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono text-background/50">
          {["HIPAA", "SOC 2 Type II", "GDPR"].map((c) => (
            <span key={c} className="border border-background/20 rounded-full px-3 py-1">
              {c}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
