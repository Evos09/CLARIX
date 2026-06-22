"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Video, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GENERAL_TYPES } from "@/lib/meetingTypes";

const PLATFORM_LABEL: Record<string, string> = {
  ZOOM: "Zoom",
  GOOGLE_MEET: "Google Meet",
  TEAMS: "Microsoft Teams",
  WEBEX: "Webex",
  UNKNOWN: "",
};

function detect(url: string): string {
  if (url.includes("zoom.us")) return "ZOOM";
  if (url.includes("meet.google")) return "GOOGLE_MEET";
  if (url.includes("teams.")) return "TEAMS";
  if (url.includes("webex")) return "WEBEX";
  return "UNKNOWN";
}

const STEPS = ["JOINING", "IN_MEETING", "DONE"];
const STEP_LABEL: Record<string, string> = { JOINING: "Joining", IN_MEETING: "Recording", DONE: "Processing" };

export function JoinWithBotTab() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("GENERAL");
  const [bot, setBot] = useState<{ botId: string; meetingId: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const platform = detect(url);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch("/api/bot/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingUrl: url, title: title || "Live meeting", meetingType: type }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Failed"); return; }
      setBot({ botId: d.botId, meetingId: d.meetingId, status: d.status });
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!bot) return;
    timer.current = setInterval(async () => {
      const r = await fetch(`/api/bot/${bot.botId}/status`);
      if (r.ok) {
        const d = await r.json();
        setBot((b) => (b ? { ...b, status: d.status } : b));
        if (d.status === "DONE" || d.status === "FAILED") {
          if (timer.current) clearInterval(timer.current);
          if (d.status === "DONE") router.push(`/meetings/${bot.meetingId}`);
        }
      }
    }, 5000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [bot?.botId, bot?.meetingId, router]);

  async function remove() {
    if (!bot) return;
    await fetch(`/api/bot/${bot.botId}`, { method: "DELETE" }).catch(() => {});
    router.push(`/meetings/${bot.meetingId}`);
  }

  if (bot) {
    const idx = STEPS.indexOf(bot.status);
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-teal/15 text-teal-600">
            <Bot className="size-7" />
          </div>
          <h3 className="text-lg font-semibold">CLARIX is joining your meeting…</h3>
          <div className="flex items-center gap-2 text-sm">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= idx ? "font-medium text-teal-600" : "text-muted-foreground"}>
                {STEP_LABEL[s]}{i < STEPS.length - 1 ? " →" : ""}
              </span>
            ))}
          </div>
          {bot.status === "FAILED" ? (
            <p className="text-sm text-destructive">The bot could not join. Check the link and try again.</p>
          ) : (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          )}
          {bot.status !== "DONE" && bot.status !== "FAILED" && (
            <Button variant="outline" size="sm" onClick={remove}>Remove bot &amp; finish</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Meeting link</label>
          <div className="relative">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste Zoom, Google Meet, or Teams link" />
            {platform !== "UNKNOWN" && url && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal-600">
                {PLATFORM_LABEL[platform]}
              </span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is this meeting about?" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Meeting type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm">
            {GENERAL_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button variant="accent" onClick={submit} disabled={submitting || platform === "UNKNOWN" || !url}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <><Video className="size-4" /> Send CLARIX</>}
        </Button>
        <p className="text-xs text-muted-foreground">CLARIX joins as a participant named &quot;CLARIX&quot;, records, and leaves automatically after the meeting ends.</p>
      </CardContent>
    </Card>
  );
}
