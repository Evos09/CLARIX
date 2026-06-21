"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Loader2, Sparkles, Copy, Check, Trash2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownView } from "@/components/chat/MarkdownView";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS_BY_TYPE: Record<string, string[]> = {
  SALES_CALL: ["What objections came up?", "What is the next step?", "Who are the decision makers?"],
  DISCOVERY_CALL: ["What are the prospect's pain points?", "What is the budget and timeline?", "How qualified is this lead?"],
  STANDUP: ["Who has blockers?", "What is at risk this sprint?", "Summarize what was done yesterday"],
  CLIENT_MEETING: ["What did we promise?", "Is the client happy?", "When is the next meeting?"],
  ONE_ON_ONE: ["What feedback was given?", "What growth areas came up?", "What support was requested?"],
  INTERVIEW: ["What are the candidate's strengths?", "Any red flags?", "What is the hire signal?"],
};

const DEFAULT_SUGGESTIONS = [
  "Summarize the key decisions.",
  "List all action items with owners.",
  "What was left unresolved?",
  "Write a follow-up email based on this meeting.",
  "Draft the action items as a Slack message.",
];

export function AskClarix({
  meetingId,
  disabled,
  meetingType = "GENERAL",
  status = "COMPLETE",
}: {
  meetingId: string;
  disabled?: boolean;
  meetingType?: string;
  status?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/meetings/${meetingId}/chat`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        if (d.locked) setLocked(true);
        else setMessages(d.messages ?? []);
      })
      .catch(() => {});
  }, [meetingId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const { reply } = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function clearChat() {
    if (!confirm("Clear this conversation?")) return;
    setMessages([]);
    await fetch(`/api/meetings/${meetingId}/chat`, { method: "DELETE" }).catch(() => {});
  }

  if (locked) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-teal/15 text-teal-600">
            <Lock className="size-5" />
          </div>
          <h3 className="text-base font-semibold">Ask CLARIX is a Pro feature</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Chat with your meeting in real time. Ask anything — who said what, what was decided, draft a follow-up
            email — all from the transcript.
          </p>
          <Link href="/settings/billing" className={cn(buttonVariants({ variant: "accent" }), "mt-2")}>Upgrade to Pro</Link>
        </CardContent>
      </Card>
    );
  }

  if (disabled) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Add <code className="font-mono">ANTHROPIC_API_KEY</code> to chat with this meeting.
        </CardContent>
      </Card>
    );
  }

  if (status !== "COMPLETE") {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          CLARIX is still analyzing this meeting. Check back once processing is done.
        </CardContent>
      </Card>
    );
  }

  const suggestions = SUGGESTIONS_BY_TYPE[meetingType] ?? DEFAULT_SUGGESTIONS;

  return (
    <Card>
      <CardContent className="flex h-[60vh] flex-col p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-teal" /> Ask CLARIX
          </span>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-muted-foreground hover:text-destructive" title="Clear chat">
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
                  <Sparkles className="size-3 text-teal-600" />{s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("group relative max-w-[80%] rounded-lg px-4 py-2 text-sm", m.role === "user" ? "whitespace-pre-wrap bg-navy text-white" : "bg-muted")}>
                {m.role === "assistant" ? <MarkdownView content={m.content} /> : m.content}
                {m.role === "assistant" && (
                  <button
                    onClick={() => { navigator.clipboard.writeText(m.content); setCopied(i); setTimeout(() => setCopied(null), 1500); }}
                    className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Copy"
                  >
                    {copied === i ? <Check className="size-3.5 text-teal-600" /> : <Copy className="size-3.5 text-muted-foreground" />}
                  </button>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> CLARIX is thinking…
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div ref={endRef} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t border-border p-4">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about this meeting…" disabled={busy} />
          <Button type="submit" variant="accent" size="icon" disabled={busy || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
