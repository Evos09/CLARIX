"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareChecklistButton({
  meetingId,
  initialShareToken,
}: {
  meetingId: string;
  initialShareToken: string | null;
}) {
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const getShareLink = async () => {
    if (shareToken) {
      copyLink(shareToken);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/share`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate link");
      const data = await res.json();
      setShareToken(data.shareToken);
      copyLink(data.shareToken);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/share/meetings/${token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => {
          getShareLink();
          setOpen(true);
        }}
        disabled={loading}
        className={cn(
          "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5",
          copied
            ? "bg-teal text-white"
            : "bg-surface text-foreground border border-border hover:bg-muted"
        )}
      >
        {copied ? (
          <>
            <Check className="size-3.5" />
            Link copied!
          </>
        ) : (
          <>
            <Share2 className="size-3.5" />
            {loading ? "Generating..." : "Share Checklist"}
          </>
        )}
      </button>

      {open && shareToken && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          
          <div className="absolute right-0 top-12 z-50 mt-1 w-72 rounded-xl border border-border bg-surface p-3.5 shadow-lg">
            <h4 className="text-[13px] font-semibold text-foreground">Public Checklist Link</h4>
            <p className="mt-1 text-[11px] leading-normal text-muted-foreground">
              Anyone with this link can check off action items in real-time. No sign-in required.
            </p>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-1.5 pl-2.5">
              <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-muted-foreground select-all">
                {window.location.origin}/share/meetings/{shareToken}
              </span>
              <button
                onClick={() => copyLink(shareToken)}
                className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-surface hover:bg-muted transition"
              >
                {copied ? <Check className="size-3.5 text-teal" /> : <Copy className="size-3.5" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
