"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Send, Loader2, FileText, Download, Copy, Mic, MicOff, Volume2, VolumeX, PhoneOff, X, ListTodo, CheckCircle2, Mail, BarChart3, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownView } from "./MarkdownView";
import { LogoSpinner } from "@/components/layout/LogoSpinner";

interface SessionMeta { id: string; title: string; updatedAt: string }
interface Citation { id: string; title: string; date: string; hl?: string }
interface Msg { role: string; content: string; citations?: Citation[] }
type Mode = "focused" | "research" | "writer";

const SUGGESTIONS = [
  "What decisions did we make this week?",
  "Show all action items due soon",
  "What has been committed to recently?",
  "Summarize my recent meetings",
  "Find discussions about the roadmap",
  "What risks were flagged recently?",
];

const COMMANDS = [
  { cmd: "/summary", desc: "Summarize recent meetings", q: "Summarize my most recent meetings.", icon: FileText },
  { cmd: "/actions", desc: "List open action items", q: "List all open action items across my recent meetings, grouped by meeting.", icon: ListTodo },
  { cmd: "/decisions", desc: "List key decisions", q: "List the key decisions from my recent meetings.", icon: CheckCircle2 },
  { cmd: "/email", desc: "Draft a follow-up email", q: "Draft a follow-up email summarizing my most recent meeting.", icon: Mail },
  { cmd: "/report", desc: "Weekly report", q: "Generate a weekly report of decisions and action items from my recent meetings.", icon: BarChart3 },
  { cmd: "/risks", desc: "Flagged risks", q: "What risks or concerns were flagged across my recent meetings?", icon: AlertCircle },
];

export function GlobalChatClient({
  usageThisMonth,
  usageLimit,
  // False on Free: the workspace can read threads it created in the overlay,
  // but composing from the dashboard is the paid feature. Defaults to true so
  // every existing caller behaves exactly as before.
  canSend = true,
}: {
  usageThisMonth: number;
  usageLimit: number | null;
  canSend?: boolean;
}) {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [usage, setUsage] = useState(usageThisMonth);
  const [limitModal, setLimitModal] = useState<{ used: number; plan: string } | null>(null);
  const [buyingPack, setBuyingPack] = useState(false);
  const [packError, setPackError] = useState<string | null>(null);
  const mode: Mode = "focused";
  const endRef = useRef<HTMLDivElement>(null);

  const [isListeningInput, setIsListeningInput] = useState(false);
  const inputRecognitionRef = useRef<any>(null);

  function toggleInputSpeech() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (isListeningInput) {
      if (inputRecognitionRef.current) {
        inputRecognitionRef.current.stop();
      }
      setIsListeningInput(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListeningInput(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInput((prev) => (prev ? prev + " " + text : text));
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech input error:", err);
        setIsListeningInput(false);
      };

      rec.onend = () => {
        setIsListeningInput(false);
      };

      inputRecognitionRef.current = rec;
      rec.start();
    }
  }

  // --- VOICE MODE CORE LOGIC ---
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [voiceInput, setVoiceInput] = useState("");
  const [voiceOutput, setVoiceOutput] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeIdRef = useRef<string | null>(activeId);
  const voiceStateRef = useRef(voiceState);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startRecognition = () => {
    if (isMuted) return;
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.log("Start recognition error:", err);
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.log("Stop recognition error:", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setVoiceState("listening");
    };

    rec.onresult = (event: any) => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setVoiceState("listening");
        setVoiceOutput("");
      }

      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        setVoiceInput(final);
        void processVoiceSpoken(final);
      } else if (interim) {
        setVoiceInput(interim);
      }
    };

    rec.onerror = (event: any) => {
      console.error("Speech recognition error", event);
      if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access in your browser.");
        setIsVoiceOpen(false);
      }
    };

    rec.onend = () => {
      if (isVoiceOpen && !isMuted) {
        setTimeout(() => {
          if (voiceStateRef.current === "listening" || voiceStateRef.current === "idle") {
            startRecognition();
          }
        }, 300);
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isVoiceOpen, isMuted]);

  useEffect(() => {
    if (isVoiceOpen) {
      setVoiceState("listening");
      setVoiceInput("");
      setVoiceOutput("");
      setTimeout(() => {
        startRecognition();
      }, 500);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setVoiceState("idle");
    }
  }, [isVoiceOpen]);

  async function processVoiceSpoken(text: string) {
    const query = text.trim();
    if (!query) return;

    setVoiceState("thinking");
    stopRecognition();

    let sid = activeIdRef.current;
    if (!sid) {
      try {
        const r = await fetch("/api/chat/sessions", { method: "POST" });
        if (!r.ok) {
          setVoiceState("listening");
          startRecognition();
          return;
        }
        sid = (await r.json()).sessionId as string;
        setActiveId(sid);
        activeIdRef.current = sid;
      } catch {
        setVoiceState("listening");
        startRecognition();
        return;
      }
    }

    setMessages((m) => [...m, { role: "user", content: query }]);

    try {
      const r = await fetch(`/api/chat/sessions/${sid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, mode }),
      });
      const d = await r.json();
      if (!r.ok) {
        const errMsg = d.error ?? "Something went wrong.";
        setMessages((m) => [...m, { role: "assistant", content: errMsg }]);
        speakVoice(errMsg);
      } else {
        const responseText = d.message.content;
        setMessages((m) => [...m, { role: "assistant", content: responseText, citations: d.citations }]);
        setUsage((u) => u + 1);
        void loadSessions();
        speakVoice(responseText);
      }
    } catch {
      const errText = "Network error occurred.";
      setMessages((m) => [...m, { role: "assistant", content: errText }]);
      speakVoice(errText);
    }
  }

  function speakVoice(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setVoiceState("listening");
      startRecognition();
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\*\*|__/g, "")
      .replace(/[*#-]/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .trim();

    setVoiceOutput(cleanText);
    setVoiceState("speaking");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      if (isVoiceOpen) {
        setVoiceState("listening");
        startRecognition();
      }
    };

    utterance.onerror = (err) => {
      console.error("Speech synthesis error", err);
      if (isVoiceOpen) {
        setVoiceState("listening");
        startRecognition();
      }
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }
  // --- END VOICE MODE CORE LOGIC ---

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

  function asText() {
    return messages.map((m) => `${m.role === "user" ? "You" : "CLARIX"}: ${m.content}`).join("\n\n");
  }
  function exportMarkdown() {
    const md = messages.map((m) => `**${m.role === "user" ? "You" : "CLARIX"}:**\n\n${m.content}`).join("\n\n---\n\n");
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "clarix-chat.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || sending || !canSend) return;
    // Clear the box and show the question BEFORE any network call. Creating a
    // session is a round trip, and leaving the text sitting there through it
    // made Enter feel like it hadn't registered — worse, if that call failed we
    // returned early and the text was never cleared at all.
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setSending(true);
    // Use the ref (synchronously current) so back-to-back sends reuse the same
    // session instead of each spawning a new one — otherwise history is lost.
    let sid = activeIdRef.current;
    if (!sid) {
      const r = await fetch("/api/chat/sessions", { method: "POST" });
      if (!r.ok) {
        setMessages((m) => [...m, { role: "assistant", content: "Couldn't start a new chat. Please try again." }]);
        setSending(false);
        return;
      }
      sid = (await r.json()).sessionId as string;
      setActiveId(sid);
      activeIdRef.current = sid;
    }
    try {
      const r = await fetch(`/api/chat/sessions/${sid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, mode }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (d.limitReached) {
          setMessages((m) => m.slice(0, -1)); // drop the un-answered user bubble
          setLimitModal({ used: d.used, plan: d.plan });
        } else {
          setMessages((m) => [...m, { role: "assistant", content: d.error ?? "Something went wrong." }]);
        }
      } else {
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

  const slashOpen = input.startsWith("/");
  const slashMatches = COMMANDS.filter((c) => c.cmd.startsWith(input.split(" ")[0]));

  return (
    <div className="flex h-screen">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2 px-4 py-4">
          <span className="text-[13px] font-semibold text-foreground">Chats</span>
        </div>
        {canSend && (
          <div className="px-3">
            <button onClick={newChat} className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2 text-[13px] font-semibold text-white transition-colors hover:bg-teal-600">
              <Plus className="size-4" /> New chat
            </button>
          </div>
        )}
        <div className="px-4 py-3 text-xs text-muted-foreground">
          {!canSend ? (
            <span>Conversations you started in the overlay.</span>
          ) : usageLimit === null ? (
            "Unlimited Clarix Chat messages"
          ) : (
            `${usage} of ${usageLimit} Clarix Chat messages this month`
          )}
          {canSend && usageLimit !== null && (
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-violet-600" style={{ width: `${Math.min(100, (usage / usageLimit) * 100)}%` }} />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => openSession(s.id)}
              className={cn(
                "group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors",
                activeId === s.id
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <span className="truncate">{s.title}</span>
              <button onClick={(e) => del(s.id, e)} className="opacity-0 group-hover:opacity-100">
                <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive transition-colors" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[52px] items-center justify-between border-b border-border px-4 bg-card shrink-0">
          <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
            <span className="text-muted-foreground">Workspace</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="truncate font-medium text-foreground">Clarix Chat</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice Mode button commented out as it is not released yet
            <button
              onClick={() => setIsVoiceOpen(!isVoiceOpen)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-300",
                isVoiceOpen
                  ? "bg-rose-600 hover:bg-rose-700 ring-2 ring-rose-500/20"
                  : "bg-violet-600 hover:bg-violet-700"
              )}
            >
              {isVoiceOpen ? (
                <>
                  <MicOff className="size-3.5 animate-pulse" /> Close Voice
                </>
              ) : (
                <>
                  <Mic className="size-3.5" /> Voice Mode (Active)
                </>
              )}
            </button>
            */}
            {messages.length > 0 && (
              <>
                <button onClick={() => navigator.clipboard.writeText(asText())} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1.5 text-xs hover:bg-muted transition-colors">
                  <Copy className="size-3" /> Copy all
                </button>
                <button onClick={exportMarkdown} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1.5 text-xs hover:bg-muted transition-colors">
                  <Download className="size-3" /> Export .md
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {messages.length === 0 ? (
            <div className="mx-auto mt-14 max-w-2xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {canSend ? "Ask anything about your meetings" : "Pick a conversation"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {canSend
                  ? "Searches across every meeting in your workspace. Type / for commands."
                  : "Your overlay conversations are listed on the left."}
              </p>
              <div className={cn("mt-8 grid gap-3 sm:grid-cols-2 text-left", !canSend && "hidden")}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-card p-4 text-left text-sm text-foreground transition-all hover:border-accent/40 hover:shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "text-sm leading-relaxed",
                      m.role === "user"
                        ? "max-w-[80%] whitespace-pre-wrap rounded-2xl bg-muted px-4 py-2.5 text-foreground"
                        : "w-full text-foreground"
                    )}
                  >
                    {m.role === "assistant" ? <MarkdownView content={m.content} /> : m.content}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.citations.map((c) => (
                          <a
                            key={c.id}
                            href={`/meetings/${c.id}${c.hl ? `?tab=transcript&hl=${encodeURIComponent(c.hl)}` : ""}`}
                            target="_blank"
                            rel="noreferrer"
                            title={c.hl ? "Opens the transcript at the cited moment" : undefined}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
                          >
                            <FileText className="size-3" /> {c.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><LogoSpinner size={18} /> Thinking…</div>}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border p-3 md:p-4">
          {!canSend ? (
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-violet-600/25 bg-violet-50/40 px-5 py-5 text-center">
              <p className="text-sm font-medium text-foreground">
                Asking from here is part of Clarix Chat
              </p>
              <p className="max-w-md text-xs text-muted-foreground">
                You can read every conversation you started in the overlay, and keep asking there on
                your monthly allowance. Upgrade to Starter to carry the conversation on from your
                desk as well.
              </p>
              <a
                href="/settings/billing"
                className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
              >
                See plans
              </a>
            </div>
          ) : (
          <div className="relative mx-auto max-w-3xl">
            {slashOpen && slashMatches.length > 0 && (
              <div className="absolute bottom-full mb-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl p-1.5 space-y-0.5 z-30">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-1.5">CLARIX Chat Commands</p>
                {slashMatches.map((c) => {
                  const Icon = (c as any).icon;
                  return (
                    <button
                      key={c.cmd}
                      onClick={() => { setInput(""); send(c.q); }}
                      className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-left text-xs font-semibold text-foreground hover:bg-violet-50/50 hover:text-violet-700 transition-colors"
                    >
                      <Icon className="size-3.5 text-violet-500 shrink-0" />
                      <span className="font-mono text-violet-600 font-bold">{c.cmd}</span>
                      <span className="text-muted-foreground font-medium ml-auto">{c.desc}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-input bg-card p-1.5 shadow-sm transition-shadow focus-within:border-accent/40 focus-within:shadow-md">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !slashOpen) { e.preventDefault(); send(input); } }}
                placeholder="Ask about your meetings…  (/ for commands, Enter to send)"
                rows={1}
                className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
              />
              {/* Voice to Text button */}
              <button
                type="button"
                onClick={toggleInputSpeech}
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full transition-all border",
                  isListeningInput
                    ? "bg-red-500/10 border-red-500/35 text-red-500 hover:bg-red-500/20 animate-pulse"
                    : "bg-muted border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                title={isListeningInput ? "Stop Voice Typing" : "Voice Typing (Speech to Text)"}
              >
                {isListeningInput ? <MicOff className="size-4 animate-bounce" /> : <Mic className="size-4" />}
              </button>
              <button onClick={() => send(input)} disabled={sending || !input.trim()} className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700 disabled:opacity-50">
                <Send className="size-4" />
              </button>
            </div>
          </div>
          )}
        </div>
      {isVoiceOpen && (
        <aside className="w-85 shrink-0 border-l border-border bg-zinc-950 text-white flex flex-col items-center justify-between p-6 relative transition-all duration-300 shadow-2xl z-20 overflow-hidden">
          {/* Subtle radial purple/indigo background aura */}
          <div className="absolute -top-40 -right-40 size-80 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

          {/* Close button top right */}
          <button
            onClick={() => setIsVoiceOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Close Voice Mode"
          >
            <X className="size-4" />
          </button>

          {/* Top Status */}
          <div className="flex flex-col items-center gap-2 mt-4 text-center">
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border",
              voiceState === "listening" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 animate-pulse" :
              voiceState === "thinking" ? "bg-amber-500/10 text-amber-400 border-amber-500/25" :
              voiceState === "speaking" ? "bg-violet-500/10 text-violet-400 border-violet-500/25" :
              "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
            )}>
              <span className={cn(
                "size-1.5 rounded-full",
                voiceState === "listening" ? "bg-emerald-400" :
                voiceState === "thinking" ? "bg-amber-400 animate-pulse" :
                voiceState === "speaking" ? "bg-violet-400" :
                "bg-zinc-400"
              )} />
              {voiceState === "listening" ? "Listening" :
               voiceState === "thinking" ? "Processing" :
               voiceState === "speaking" ? "Speaking" : "Connected"}
            </span>
            <p className="text-[10px] text-zinc-500 font-medium">Clarix Real-time Audio Link</p>
          </div>

          {/* Center Visual Waveforms (Modern Minimalist Audio Spectrogram) */}
          <div className="relative flex items-center justify-center my-10 w-full h-40">
            <style>{`
              @keyframes waveform-bounce {
                0% { transform: scaleY(0.3); }
                100% { transform: scaleY(1); }
              }
              .bar-anim {
                animation: waveform-bounce 0.6s infinite alternate ease-in-out;
              }
            `}</style>
            
            {/* Listening: Gentle pulsing wave */}
            {voiceState === "listening" && (
              <div className="flex items-center justify-center gap-1.5 h-16 w-full px-8">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-500 rounded-full bar-anim"
                    style={{
                      height: `${10 + Math.sin(i * 0.5) * 20}px`,
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: `${0.4 + (i % 3) * 0.15}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Speaking: Dynamic bouncing spectrum */}
            {voiceState === "speaking" && (
              <div className="flex items-center justify-center gap-1.5 h-20 w-full px-8">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-violet-600 to-indigo-500 rounded-full bar-anim"
                    style={{
                      height: `${15 + (i % 4 === 0 ? 30 : i % 3 === 0 ? 25 : 15)}px`,
                      animationDelay: `${i * 0.04}s`,
                      animationDuration: `${0.3 + (i % 4) * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Thinking: Smooth circular scanning glow */}
            {voiceState === "thinking" && (
              <div className="relative size-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin duration-1000" />
                <Loader2 className="size-6 animate-spin text-violet-500/80" />
              </div>
            )}

            {/* Idle / Connected: Static flat baseline */}
            {(voiceState === "idle" || (voiceState !== "speaking" && voiceState !== "listening" && voiceState !== "thinking")) && (
              <div className="flex items-center justify-center gap-1.5 h-2 w-full px-12">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-zinc-700 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Subtitles / Real-time Transcript Block */}
          <div className="w-full flex-1 flex flex-col justify-center min-h-[120px] max-h-[160px] text-center px-4 py-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80 backdrop-blur-md overflow-y-auto my-6">
            {voiceInput && (
              <p className="text-zinc-400 text-xs font-medium break-words leading-relaxed">
                &ldquo;{voiceInput}&rdquo;
              </p>
            )}
            {voiceState === "speaking" && voiceOutput && (
              <p className="text-white text-sm font-semibold leading-relaxed break-words mt-1">
                {voiceOutput}
              </p>
            )}
            {!voiceInput && !(voiceState === "speaking" && voiceOutput) && (
              <p className="text-zinc-500 text-xs font-medium italic">
                Ask anything, like: "What action items were decided today?"
              </p>
            )}
          </div>

          {/* Controls Footer */}
          <div className="w-full flex items-center justify-center gap-3 mt-auto pb-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-3 rounded-full transition-all border shadow-sm",
                isMuted
                  ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              )}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>

            <button
              onClick={() => setIsVoiceOpen(false)}
              className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all border border-red-500/30"
              title="Hang Up"
            >
              <PhoneOff className="size-4" /> End Call
            </button>
          </div>
        </aside>
      )}
      </div>

      {limitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setLimitModal(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-600/20 bg-violet-50/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-700">
              Monthly limit reached
            </span>
            <h3 className="mt-3 text-lg font-bold text-foreground">You&apos;re out of Clarix Chat messages</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              You&apos;ve used all {limitModal.used} messages this month. Add more to keep chatting, or upgrade for a higher limit.
            </p>
            <div className="mt-5 space-y-2.5">
              <button
                disabled={buyingPack}
                onClick={async () => {
                  setBuyingPack(true);
                  setPackError(null);
                  try {
                    const r = await fetch("/api/billing/pack", { method: "POST" });
                    const d = await r.json().catch(() => ({}));
                    if (r.ok && d.url) {
                      window.location.href = d.url;
                      return;
                    }
                    setPackError(d.error || `Couldn't start checkout (${r.status}).`);
                  } catch {
                    setPackError("Network error — please try again.");
                  }
                  setBuyingPack(false);
                }}
                className="flex w-full items-center justify-between rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                <span>{buyingPack ? "Starting checkout…" : "Buy 100 more messages"}</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">$9</span>
              </button>
              {limitModal.plan !== "BUSINESS" && (
                <a
                  href="/settings/billing"
                  className="flex w-full items-center justify-center rounded-xl border border-violet-600/40 px-4 py-3 text-sm font-semibold text-violet-600 transition hover:bg-violet-50/50"
                >
                  Upgrade for unlimited
                </a>
              )}
              {packError && <p className="text-center text-xs text-red-600">{packError}</p>}
            </div>
            <button
              onClick={() => setLimitModal(null)}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
