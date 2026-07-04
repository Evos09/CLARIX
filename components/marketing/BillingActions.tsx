"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BillingActions() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: string) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setLoading(null);
    }
  }

  async function portal() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {["STARTER", "PRO", "BUSINESS"].map((p) => (
          <Button key={p} variant={p === "PRO" ? "accent" : "outline"} onClick={() => checkout(p)} disabled={!!loading}>
            {loading === p ? <Loader2 className="size-4 animate-spin" /> : `Upgrade to ${p[0]}${p.slice(1).toLowerCase()}`}
          </Button>
        ))}
        <Button variant="ghost" onClick={portal} disabled={!!loading}>
          {loading === "portal" ? <Loader2 className="size-4 animate-spin" /> : "Manage billing"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
