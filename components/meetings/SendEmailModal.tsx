"use client";

import { useState } from "react";
import { X, Send, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPES = [
  { id: "SUMMARY", label: "Summary" },
  { id: "ACTION_ITEMS", label: "Action Items" },
  { id: "FULL_REPORT", label: "Full Report" },
];

export function SendEmailModal({ meetingId, onClose }: { meetingId: string; onClose: () => void }) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [type, setType] = useState("SUMMARY");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function addRecipient(v: string) {
    const e = v.trim().replace(/,$/, "").trim();
    if (e && !recipients.includes(e)) setRecipients((r) => [...r, e]);
    setDraft("");
  }

  async function send() {
    const list = draft.trim() ? [...recipients, draft.trim()] : recipients;
    if (list.length === 0) {
      setError("Add at least one recipient.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients: list, type }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Failed");
      setSent(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Send via Email</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>

        <label className="mb-1 block text-sm font-medium">Recipients</label>
        <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background p-2">
          {recipients.map((r) => (
            <span key={r} className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
              {r}
              <button onClick={() => setRecipients((x) => x.filter((e) => e !== r))}><X className="size-3" /></button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addRecipient(draft); } }}
            onBlur={() => draft.trim() && addRecipient(draft)}
            placeholder="name@company.com"
            className="min-w-[140px] flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <label className="mb-1 mt-4 block text-sm font-medium">What to send</label>
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`flex-1 rounded-md border px-2 py-2 text-xs ${type === t.id ? "border-teal bg-teal/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <Button onClick={send} variant="accent" className="mt-4 w-full" disabled={sending || sent}>
          {sent ? <Check className="size-4" /> : sending ? <Loader2 className="size-4 animate-spin" /> : <><Send className="size-4" /> Send</>}
        </Button>
      </div>
    </div>
  );
}
