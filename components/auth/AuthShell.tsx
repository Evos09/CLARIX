import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import Link from "next/link";

/*
  AuthShell — branded split-screen wrapper for the Clerk sign-in / sign-up forms.
  Implements the "CLARIX Signup" Claude Design: form on the left, navy value
  panel (animated morph card + honest value props) on the right. The right panel
  collapses on small screens so the form goes full-width (the "CLARIX Mobile" case).
*/

const AUTH_CSS = `
@keyframes auth-blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-24px) scale(1.12)}}
@keyframes auth-orb{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(124,79,232,.45)}50%{transform:scale(1.08);box-shadow:0 0 0 12px rgba(124,79,232,0)}}
@keyframes auth-line{0%{opacity:0;transform:translateX(-6px)}100%{opacity:1;transform:translateX(0)}}
@keyframes auth-check{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
.auth-item{animation:auth-line .5s ease both}
.auth-check{animation:auth-check .4s ease both}
@media (prefers-reduced-motion:reduce){.auth-blob,.auth-orb,.auth-item,.auth-check{animation:none !important}}
`;

const PROPS = [
  { big: "10", small: "free meetings / month" },
  { big: "20+", small: "meeting types tuned" },
  { big: "30s", small: "to your first summary" },
];

export function AuthShell({
  mode,
  children,
}: {
  mode: "sign-up" | "sign-in";
  children: ReactNode;
}) {
  const isSignUp = mode === "sign-up";

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <style dangerouslySetInnerHTML={{ __html: AUTH_CSS }} />

      {/* LEFT — form */}
      <div className="relative flex flex-col bg-background px-6 py-8 sm:px-10">
        <header>
          <Logo />
        </header>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
              {isSignUp ? "Start free in 30 seconds" : "Welcome back"}
            </h1>
            <p className="mt-2 mb-7 text-[15px] leading-relaxed text-muted-foreground">
              {isSignUp
                ? "10 free meetings every month. No credit card required."
                : "Sign in to your CLARIX workspace."}
            </p>

            {children}

            <p className="mt-7 text-sm text-muted-foreground">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <Link href="/sign-in" className="font-semibold text-accent hover:text-accent/80">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New to CLARIX?{" "}
                  <Link href="/sign-up" className="font-semibold text-accent hover:text-accent/80">
                    Create an account
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>

        <footer className="flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} CLARIX</span>
          <div className="flex gap-2">
            <span className="rounded-md border border-teal/30 bg-teal/10 px-2 py-1 font-semibold text-teal-600">
              🔒 Encrypted
            </span>
            <span className="rounded-md border border-teal/30 bg-teal/10 px-2 py-1 font-semibold text-teal-600">
              No card required
            </span>
          </div>
        </footer>
      </div>

      {/* RIGHT — editorial value panel, matching the homepage backdrop */}
      <div className="relative hidden overflow-hidden bg-background p-14 lg:flex lg:flex-col lg:justify-center">
        {/* faint vertical grid, like the homepage */}
        <div className="absolute inset-0 overflow-hidden opacity-40" aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="absolute w-px bg-foreground/[0.06]"
              style={{ left: `${12.5 * (i + 1)}%`, top: 0, bottom: 0 }}
            />
          ))}
        </div>
        {/* giant CLARIX watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none" aria-hidden>
          <span className="font-display leading-none tracking-tight text-foreground/[0.04] text-[clamp(6rem,18vw,15rem)]">
            CLARIX
          </span>
        </div>

        <div className="relative max-w-md">
          <span className="mb-6 flex items-center gap-3 font-mono text-sm text-muted-foreground">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            Now live · no credit card
          </span>

          <h2 className="mb-8 font-display text-[32px] leading-[1.1] tracking-tight text-foreground">
            Watch a messy meeting become{" "}
            <span className="relative inline-block">
              done
              <span className="absolute -bottom-0.5 left-0 right-0 h-2 bg-brand/20" />
            </span>
            .
          </h2>

          <div className="flex gap-8">
            {PROPS.map((p) => (
              <div key={p.small}>
                <div className="font-display text-3xl tracking-tight text-foreground">{p.big}</div>
                <div className="mt-1 text-xs text-muted-foreground">{p.small}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
