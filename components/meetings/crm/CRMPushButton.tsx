"use client";

import { useState } from "react";
import { Loader2, Check, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CRMPushButton({ meetingId }: { meetingId: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function push() {
    setState("busy");
    try {
      const r = await fetch(`/api/meetings/${meetingId}/crm`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) { setMsg(d.error ?? "Failed"); setState("error"); return; }
      setMsg(`Synced to ${d.provider === "SALESFORCE" ? "Salesforce" : "HubSpot"}`);
      setState("done");
    } catch {
      setMsg("Failed");
      setState("error");
    }
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={push} disabled={state === "busy" || state === "done"}>
        {state === "busy" ? <Loader2 className="size-4 animate-spin" /> : state === "done" ? <Check className="size-4 text-green-600" /> : <Database className="size-4" />}
        {state === "done" ? msg : "Push to CRM"}
      </Button>
      {state === "error" && <p className="absolute right-0 mt-1 whitespace-nowrap text-xs text-destructive">{msg}</p>}
    </div>
  );
}
