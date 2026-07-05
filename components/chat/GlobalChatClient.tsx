"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Send, Loader2, FileText, Download, Copy, Mic, MicOff, Volume2, VolumeX, PhoneOff, X, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownView } from "./MarkdownView";

interface SessionMeta { id: string; title: string; updatedAt: string }
interface Citation { id: string; title: string; date: string }
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
  { cmd: "/summary", desc: "Summarize recent meetings", q: "Summarize my most recent meetings." },
  { cmd: "/actions", desc: "List open action items", q: "List all open action items across my recent meetings, grouped by meeting." },
  { cmd: "/decisions", desc: "List key decisions", q: "List the key decisions from my recent meetings." },
  { cmd: "/email", desc: "Draft a follow-up email", q: "Draft a follow-up email summarizing my most recent meeting." },
  { cmd: "/report", desc: "Weekly report", q: "Generate a weekly report of decisions and action items from my recent meetings." },
  { cmd: "/risks", desc: "Flagged risks", q: "What risks or concerns were flagged across my recent meetings?" },
];

export function GlobalChatClient({ usageThisMonth, usageLimit }: { usageThisMonth: number; usageLimit: number | null }) {
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [usage, setUsage] = useState(usageThisMonth);
  const mode: Mode = "focused";
  const endRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ message: msg, mode }),
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

  const slashOpen = input.startsWith("/");
  const slashMatches = COMMANDS.filter((c) => c.cmd.startsWith(input.split(" ")[0]));

  return (
    <div className="flex h-screen">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2 px-4 py-4">
          <Brain className="size-4 text-violet-600" />
          <span className="text-sm font-bold text-foreground">Clarix AI</span>
        </div>
        <div className="px-3">
          <button onClick={newChat} className="flex w-full items-center justify-center gap-2 rounded-md border border-violet-600/40 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50/5 hover:border-violet-600 transition-colors">
            <Plus className="size-4" /> New Chat
          </button>
        </div>
        <div className="px-4 py-3 text-xs text-muted-foreground">
          {usageLimit === null ? "Unlimited Ask CLARIX messages" : `${usage} of ${usageLimit} Ask CLARIX messages this month`}
          {usageLimit !== null && (
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
                "group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                activeId === s.id
                  ? "border-l-2 border-violet-600 bg-violet-50/10 text-violet-700 font-semibold"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
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
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5 bg-card shrink-0">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-violet-100 p-1.5 text-violet-700">
              <Brain className="size-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Clarix Chat</span>
              <span className="ml-2 rounded-full bg-violet-100 text-violet-700 px-2 py-0.5 text-[10px] font-bold">AI Companion</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <div className="mx-auto mt-10 max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-foreground">Ask anything about your meetings.</h2>
              <p className="mt-2 text-sm text-muted-foreground font-medium">Searches across all your meetings. Type / for commands.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-card/50 p-4 text-left text-sm font-medium transition hover:border-violet-500 hover:bg-violet-50/10 hover:shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] text-sm shadow-sm leading-relaxed",
                      m.role === "user"
                        ? "whitespace-pre-wrap rounded-2xl rounded-br-sm bg-gradient-to-tr from-violet-600 to-indigo-600 px-4 py-2.5 text-white font-medium"
                        : "rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-foreground"
                    )}
                  >
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
              {sending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin text-violet-600" /> CLARIX is thinking…</div>}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border p-3 md:p-4">
          <div className="relative mx-auto max-w-3xl">
            {slashOpen && slashMatches.length > 0 && (
              <div className="absolute bottom-full mb-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                {slashMatches.map((c) => (
                  <button key={c.cmd} onClick={() => { setInput(""); send(c.q); }} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted">
                    <span className="font-mono text-teal-600">{c.cmd}</span>
                    <span className="text-muted-foreground">{c.desc}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 rounded-[1.75rem] border border-input bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-violet-600/30">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !slashOpen) { e.preventDefault(); send(input); } }}
                placeholder="Ask about your meetings…  (/ for commands, Enter to send)"
                rows={1}
                className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm focus-visible:outline-none"
              />
              <button onClick={() => send(input)} disabled={sending || !input.trim()} className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700 disabled:opacity-50">
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      {isVoiceOpen && (
        <aside className="w-80 shrink-0 border-l border-border bg-[#0B0B14] text-white flex flex-col items-center justify-between p-6 relative transition-all duration-300 shadow-2xl z-20">
          <style>{`
            @keyframes orb-pulse {
              0% { transform: scale(1); box-shadow: 0 0 30px rgba(109,40,217,0.3), inset 0 0 15px rgba(109,40,217,0.15); }
              50% { transform: scale(1.06); box-shadow: 0 0 50px rgba(109,40,217,0.7), inset 0 0 25px rgba(109,40,217,0.4); }
              100% { transform: scale(1); box-shadow: 0 0 30px rgba(109,40,217,0.3), inset 0 0 15px rgba(109,40,217,0.15); }
            }
            @keyframes ring-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .animate-orb-pulse {
              animation: orb-pulse 3s infinite ease-in-out;
            }
            .animate-ring-spin-slow {
              animation: ring-spin 12s infinite linear;
            }
            .animate-ring-spin-fast {
              animation: ring-spin 3s infinite linear;
            }
            .animate-bar {
              animation: bar-rise 1.2s infinite ease-in-out alternate;
            }
            @keyframes bar-rise {
              0% { height: 8px; }
              100% { height: 36px; }
            }
          `}</style>

          {/* Close button top right */}
          <button
            onClick={() => setIsVoiceOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
            title="Close Voice Mode"
          >
            <X className="size-4" />
          </button>

          {/* Top Status */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "size-2 rounded-full",
                voiceState === "listening" ? "bg-teal animate-pulse" :
                voiceState === "thinking" ? "bg-amber-500 animate-spin" :
                voiceState === "speaking" ? "bg-emerald-500 animate-pulse" : "bg-neutral-500"
              )} />
              <span className="text-xs font-semibold tracking-wider uppercase text-white/60">
                {voiceState === "listening" ? "Listening" :
                 voiceState === "thinking" ? "CLARIX is thinking" :
                 voiceState === "speaking" ? "CLARIX is speaking" : "Voice Connected"}
              </span>
            </div>
            <p className="text-[10px] text-white/40">Speak naturally at any time</p>
          </div>

          {/* Center Orb & Rings (scaled down for sidebar) */}
          <div className="relative flex items-center justify-center my-6 size-48">
            {/* Outermost ring */}
            <div className={cn(
              "absolute inset-0 rounded-full border border-dashed border-teal/20 transition-all duration-1000",
              voiceState === "speaking" ? "animate-ring-spin-slow" : "animate-ring-spin-fast"
            )} />

            {/* Inner ring */}
            <div className={cn(
              "absolute inset-4 rounded-full border border-double border-teal/40 transition-all duration-700",
              voiceState === "speaking" ? "animate-ring-spin-fast" : "animate-ring-spin-slow"
            )} />

            {/* Glowing Orb */}
            <div className={cn(
              "absolute inset-8 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-teal-500 flex items-center justify-center transition-all duration-500",
              voiceState !== "idle" && "animate-orb-pulse"
            )}>
              {/* Speaking Waveforms */}
              {voiceState === "speaking" && (
                <div className="flex items-center gap-1 h-10">
                  <div className="w-1 bg-white rounded-full animate-bar" style={{ animationDelay: "0.1s" }} />
                  <div className="w-1 bg-white rounded-full animate-bar" style={{ animationDelay: "0.3s" }} />
                  <div className="w-1 bg-white rounded-full animate-bar" style={{ animationDelay: "0.5s" }} />
                  <div className="w-1 bg-white rounded-full animate-bar" style={{ animationDelay: "0.2s" }} />
                  <div className="w-1 bg-white rounded-full animate-bar" style={{ animationDelay: "0.4s" }} />
                </div>
              )}

              {/* Thinking Loader */}
              {voiceState === "thinking" && (
                <Loader2 className="size-8 animate-spin text-white" />
              )}

              {/* Listening Icon */}
              {voiceState === "listening" && (
                <Mic className="size-8 text-white animate-pulse" />
              )}
            </div>
          </div>

          {/* Real-time Subtitles/Captions (designed for sidebar) */}
          <div className="w-full flex-1 flex flex-col justify-center max-h-36 text-center space-y-3 px-2 overflow-y-auto my-4 bg-white/5 rounded-lg p-3 border border-white/10">
            {voiceInput && (
              <p className="text-white/60 text-xs italic break-words">
                &ldquo;{voiceInput}&rdquo;
              </p>
            )}
            {voiceState === "speaking" && voiceOutput && (
              <p className="text-white text-sm font-medium leading-relaxed break-words">
                {voiceOutput}
              </p>
            )}
            {!voiceInput && !(voiceState === "speaking" && voiceOutput) && (
              <p className="text-white/30 text-xs italic">
                Try asking: "What did we decide in yesterday's meeting?"
              </p>
            )}
          </div>

          {/* Controls Footer */}
          <div className="w-full flex items-center justify-center gap-4 mt-auto pb-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-3 rounded-full transition shadow-md",
                isMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/10 hover:bg-white/20 text-white"
              )}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>

            <button
              onClick={() => setIsVoiceOpen(false)}
              className="px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
              title="Hang Up"
            >
              <PhoneOff className="size-4" /> End Voice
            </button>
          </div>
        </aside>
      )}
      </div>
    </div>
  );
}
