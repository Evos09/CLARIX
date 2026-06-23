import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";

/*
  AuthShell — branded split-screen wrapper for the Clerk sign-in / sign-up forms.
  Implements the "CLARIX Signup" Claude Design: form on the left, navy value
  panel (animated morph card + honest value props) on the right. The right panel
  collapses on small screens so the form goes full-width (the "CLARIX Mobile" case).
*/

const AUTH_CSS = `
@keyframes auth-blob{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-24px) scale(1.12)}}
@keyframes auth-orb{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(0,200,180,.45)}50%{transform:scale(1.08);box-shadow:0 0 0 12px rgba(0,200,180,0)}}
@keyframes auth-line{0%{opacity:0;transform:translateX(-6px)}100%{opacity:1;transform:translateX(0)}}
@keyframes auth-check{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
.auth-item{animation:auth-line .5s ease both}
.auth-check{animation:auth-check .4s ease both}
@media (prefers-reduced-motion:reduce){.auth-blob,.auth-orb,.auth-item,.auth-check{animation:none !important}}
`;

const TASKS = [
  { t: "Own regression suite", who: "Dana", d: ".2s", cd: ".4s" },
  { t: "Draft pricing copy", who: "Sarah", d: ".5s", cd: ".7s" },
  { t: "Confirm free-tier limit", who: "Mike", d: ".8s", cd: "1s" },
];

const PROPS = [
  { big: "10", small: "free meetings / month" },
  { big: "6", small: "meeting types tuned" },
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
      <div className="relative flex flex-col bg-surface px-6 py-8 sm:px-10">
        <header>
          <Logo />
        </header>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-[34px]">
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
                  <a href="/sign-in" className="font-semibold text-navy hover:text-teal-600">
                    Sign in
                  </a>
                </>
              ) : (
                <>
                  New to CLARIX?{" "}
                  <a href="/sign-up" className="font-semibold text-navy hover:text-teal-600">
                    Create an account
                  </a>
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

      {/* RIGHT — navy value panel */}
      <div className="relative hidden overflow-hidden bg-navy p-14 lg:flex lg:flex-col lg:justify-center">
        <div
          className="auth-blob pointer-events-none absolute -right-16 -top-24 size-[420px] rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle,rgba(0,200,180,.24),transparent 65%)", animation: "auth-blob 15s ease-in-out infinite" }}
        />
        <div
          className="auth-blob pointer-events-none absolute -bottom-32 -left-20 size-[360px] rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle,rgba(0,200,180,.14),transparent 65%)", animation: "auth-blob 19s ease-in-out infinite reverse" }}
        />

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-[12.5px] font-semibold text-teal">
            No setup. Value in 2 taps.
          </span>
          <h2 className="mt-6 mb-7 text-[28px] font-extrabold leading-tight tracking-tight text-white">
            Watch a messy meeting become <span className="text-teal">done</span>.
          </h2>

          {/* mini morph card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-[18px] backdrop-blur">
            <div className="mb-3.5 flex items-center gap-2.5">
              <div
                className="auth-orb grid size-9 place-items-center rounded-full"
                style={{ background: "linear-gradient(135deg,#00C8B4,#0A1628)", animation: "auth-orb 3s ease-in-out infinite" }}
              >
                <span className="size-3 rounded-full bg-white" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-white">Product Sync · 47:32</div>
                <div className="font-mono text-[11px] text-white/50">processed in 12s</div>
              </div>
            </div>
            <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/40">
              Action items
            </div>
            <div className="flex flex-col gap-[7px]">
              {TASKS.map((task) => (
                <div
                  key={task.t}
                  className="auth-item flex items-center gap-2.5 rounded-lg bg-teal/[0.08] px-2.5 py-2"
                  style={{ animationDelay: task.d }}
                >
                  <span
                    className="auth-check grid size-4 place-items-center rounded-[5px] bg-teal text-[10px] font-black text-navy"
                    style={{ animationDelay: task.cd }}
                  >
                    ✓
                  </span>
                  <span className="flex-1 text-[12.5px] text-white">{task.t}</span>
                  <span className="rounded-full bg-navy px-2 py-0.5 text-[10.5px] font-semibold text-white">
                    {task.who}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex gap-6">
            {PROPS.map((p) => (
              <div key={p.small}>
                <div className="text-2xl font-extrabold text-white">{p.big}</div>
                <div className="text-xs text-white/55">{p.small}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
