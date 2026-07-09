"use client";

import { useState } from "react";

/**
 * Buy a one-time Clarix Chat overage pack (100 messages / $9). Posts to
 * /api/billing/pack and redirects to Stripe Checkout. Surfaces the API error
 * instead of failing silently, so a misconfigured price id is visible.
 */
export function BuyPackButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/pack", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url as string;
        return;
      }
      setError(data.error || `Couldn't start checkout (${res.status}).`);
    } catch {
      setError("Network error — please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-base font-semibold text-foreground">Need more Clarix Chat messages?</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a pack of 100 extra messages on top of your plan&apos;s monthly allowance. One-time charge, credited instantly.
      </p>
      <button
        onClick={buy}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
      >
        <span>{loading ? "Starting checkout…" : "Buy 100 more messages"}</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">$9</span>
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
