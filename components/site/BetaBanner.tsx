"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlaskConical, X } from "lucide-react";

const DISMISS_KEY = "clarix-beta-notice-dismissed";

export function BetaBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 pointer-events-none">
      <div className="pointer-events-auto mx-auto flex max-w-3xl items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50/95 px-4 py-3 text-amber-950 shadow-lg backdrop-blur">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-700" />
        <p className="flex-1 text-xs leading-relaxed">
          <strong className="font-semibold">CLARIX is in beta.</strong> Things may break, and
          features can change. We fix reported problems as quickly as we can, but we can&apos;t
          guarantee uninterrupted service. Paid plans start with a 14-day free trial — after that,
          charges already made are non-refundable, though you can cancel anytime to stop future
          billing.{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-amber-800">
            Terms
          </Link>
        </p>
        <button
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1");
            setHidden(true);
          }}
          aria-label="Dismiss beta notice"
          className="-m-1 rounded p-1 text-amber-700 transition-colors hover:bg-amber-200/60 hover:text-amber-900"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
