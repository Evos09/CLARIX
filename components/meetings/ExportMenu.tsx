"use client";

import { useState } from "react";
import { Download, ChevronDown, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FILE_FORMATS = [
  { fmt: "pdf", label: "PDF report" },
  { fmt: "docx", label: "Word (DOCX)" },
  { fmt: "csv", label: "Action items (CSV)" },
  { fmt: "json", label: "JSON" },
];
const DRAFTS = [
  { fmt: "email", label: "Follow-up email" },
  { fmt: "slack", label: "Slack message" },
];

export function ExportMenu({ meetingId, showEhr = false }: { meetingId: string; showEhr?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function download(fmt: string) {
    window.open(`/api/meetings/${meetingId}/export?format=${fmt}`, "_blank");
    setOpen(false);
  }

  async function genDraft(fmt: string) {
    setLoading(fmt);
    setError(null);
    setDraft(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/export?format=${fmt}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setDraft(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
      setOpen(false);
    }
  }

  const fileFormats = showEhr ? [...FILE_FORMATS, { fmt: "ehr_hl7", label: "EHR (FHIR JSON)" }] : FILE_FORMATS;

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        <Download className="size-4" /> Export <ChevronDown className="size-3" />
      </Button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-52 rounded-md border border-border bg-card p-1 shadow-lg">
          {fileFormats.map((f) => (
            <button key={f.fmt} onClick={() => download(f.fmt)} className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-muted">
              {f.label}
            </button>
          ))}
          <div className="my-1 border-t border-border" />
          {DRAFTS.map((f) => (
            <button key={f.fmt} onClick={() => genDraft(f.fmt)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm hover:bg-muted">
              {loading === f.fmt ? <Loader2 className="size-3 animate-spin" /> : null}
              {f.label}
            </button>
          ))}
        </div>
      )}
      {error && <p className="absolute right-0 mt-2 text-xs text-destructive">{error}</p>}
      {draft !== null && (
        <div className="absolute right-0 z-20 mt-2 w-96 rounded-md border border-border bg-card p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Generated draft</span>
            <button
              onClick={() => { navigator.clipboard.writeText(draft); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs hover:bg-muted"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea readOnly value={draft} className="h-48 w-full rounded border border-input bg-background p-2 text-xs" />
          <button onClick={() => setDraft(null)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">Close</button>
        </div>
      )}
    </div>
  );
}
