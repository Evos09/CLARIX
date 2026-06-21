"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Send, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownView } from "./MarkdownView";

interface SessionMeta { id: string; title: string; updatedAt: string }
interface Citation { id: string; title: string; date: string }
interface Msg { role: string; content: string; citations?: Citation[] }

const SUGGESTIONS = [
  "What decisions did we make this week?",
  "Show all action items due soon",
  "What has been committed to recently?",
  "Summarize my recent meetings",
  "Find discussions about the roadmap",
  "What risks were flagged recently?",
];

export function GlobalChatClient({ usageThisMonth, usageLimit }: { usageThisMonth: number; usageLimit: number | null }) {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [usage, setUsage] = useState(usageThisMonth);
  const endRef = useRef<HTMLDivElement>(null);

  async function loadSessions() {
    const r = await fetch("/api/chat/sessions");
    if (r.ok) setSessions((await r.json()).sessions);
  }
  useEffect(() => { void loadSessions(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function openSession(id: string) {
    setActiveId(id);
    const r = await fetch(`/api/chat/sessions/${id}`);
    if (r.ok) setMessages((await r.json()).messages);
  }
  function newChat() {
    setActiveId(null);
    setMessages([]);
  }
  async function del(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
    if (activeId === id) { setActiveId(null); setMessages([]); }
    void loadSessions();
  }

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || sending) return;
    let sid = activeId;
    if (!sid) {
      const r = await fetch("/api/chat/sessions", { method: "POST" });
      if (!r.ok) return;
      sid = (await r.json()).sessionId as string;
      setActiveId(sid);
    }
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setSending(true);
    try {
      const r = await fetch(`/api/chat/sessions/${sid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const d = await r.json();
      if (!r.ok) setMessages((m) => [...m, { role: "assistant", content: d.error ?? "Something went wrong." }]);
      else {
        setMessages((m) => [...m, { role: "assistant", content: d.message.content, citations: d.citations }]);
        setUsage((u) => u + 1);
        void loadSessions();
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-screen">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2 px-4 py-4">
          <span className="size-2 animate-pulse rounded-full bg-teal" />
          <span className="text-sm font-semibold">CLARIX AI</span>
        </div>
        <div className="px-3">
          <button onClick={newChat} className="flex w-full items-center justify-center gap-2 rounded-md border border-teal/40 py-2 text-sm font-medium text-teal-600 hover:bg-teal/5">
            <Plus className="size-4" /> New Chat
          </button>
        </div>
        <div className="px-4 py-3 text-xs text-muted-foreground">
          {usageLimit === null ? "Unlimited messages" : `${usage} of ${usageLimit} messages this month`}
          {usageLimit !== null && (
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-teal" style={{ width: `${Math.min(100, (usage / usageLimit) * 100)}%` }} />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => openSession(s.id)}
              className={cn(
                "group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm",
                activeId === s.id ? "border-l-2 border-teal bg-muted" : "hover:bg-muted",
              )}
            >
              <span className="truncate">{s.title}</span>
              <button onClick={(e) => del(s.id, e)} className="opacity-0 group-hover:opacity-100">
                <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {messages.length === 0 ? (
            <div className="mx-auto mt-10 max-w-2xl text-center">
              <h2 className="text-2xl font-semibold">Ask anything about your meetings.</h2>
              <p className="mt-2 text-sm text-muted-foreground">CLARIX searches across all your meetings to answer.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-lg border border-border p-3 text-left text-sm hover:border-teal hover:bg-teal/5">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%] whitespace-pre-wrap text-sm", m.role === "user" ? "rounded-lg bg-navy px-4 py-2 text-white" : "rounded-lg border-l-2 border-teal bg-card px-4 py-3")}>
                    {m.role === "assistant" ? <MarkdownView content={m.content} /> : m.content}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.citations.map((c) => (
                          <a key={c.id} href={`/meetings/${c.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-xs hover:border-teal">
                            <FileText className="size-3" /> {c.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> CLARIX is thinking…</div>}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border p-3 md:p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask about your meetings…  (Enter to send)"
              rows={1}
              className="max-h-40 flex-1 resize-none rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button onClick={() => send(input)} disabled={sending || !input.trim()} className="grid size-10 shrink-0 place-items-center rounded-md bg-teal text-navy disabled:opacity-50">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
