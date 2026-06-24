"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SpeakerStat { speaker: string; talkPercent?: number; wordCount?: number; fillerWords?: number; longestMonologueSeconds?: number }
interface Analytics {
  overallEngagement: number;
  participationBalance: number;
  overallSentiment: string;
  fillerWordCount: number;
  sentimentByMinute: { minute: number; score: number }[];
  speakerStats: SpeakerStat[];
  energyTimeline: { minute: number; energy: number }[];
  topicTimeline: { topic: string; startMinute: number; endMinute: number; sentiment: string }[];
  insights: string[];
  recommendations: string[];
}

const SENTIMENT_EMOJI: Record<string, string> = { POSITIVE: "😊", NEUTRAL: "😐", MIXED: "🤔", TENSE: "😬" };
const BAR_COLORS = ["#0b0b14", "#5b21b6", "#2563eb", "#9333ea", "#ea580c", "#db2777"];

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function AnalyticsTab({ meetingId }: { meetingId: string }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [state, setState] = useState<"loading" | "notReady" | "error" | "ready">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/meetings/${meetingId}/analytics`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setError(d.error ?? "Failed"); setState("error"); return; }
        if (d.notReady) { setState("notReady"); return; }
        setData(d);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [meetingId]);

  if (state === "loading") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Running analytics…</div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (state === "notReady") return <p className="text-sm text-muted-foreground">Analytics available after meeting processing completes.</p>;
  if (state === "error" || !data) return <p className="text-sm text-destructive">{error || "Could not load analytics."}</p>;

  const speakerData = (data.speakerStats ?? []).map((s) => ({ name: `Speaker ${s.speaker}`, value: Math.round(s.talkPercent ?? 0), words: s.wordCount ?? 0, filler: s.fillerWords ?? 0 }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Engagement" value={`${Math.round(data.overallEngagement)}`} hint="out of 100" />
        <Metric label="Participation balance" value={`${Math.round(data.participationBalance)}`} hint={data.participationBalance >= 60 ? "Balanced" : "Skewed"} />
        <Metric label="Sentiment" value={`${SENTIMENT_EMOJI[data.overallSentiment] ?? "😐"} ${data.overallSentiment}`} />
        <Metric label="Filler words" value={`${data.fillerWordCount}`} />
      </div>

      {speakerData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Speaker breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(120, speakerData.length * 48)}>
              <BarChart data={speakerData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} unit="%" fontSize={12} />
                <YAxis type="category" dataKey="name" width={90} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {speakerData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.sentimentByMinute?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Sentiment over time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.sentimentByMinute}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="minute" unit="m" fontSize={12} />
                <YAxis domain={[0, 1]} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#6d28d9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.energyTimeline?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Energy timeline</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.energyTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="minute" unit="m" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="energy" stroke="#0b0b14" fill="#6d28d9" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {data.topicTimeline?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Topics</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.topicTimeline.map((t, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                <span>{t.topic}</span>
                <span className="text-xs text-muted-foreground">{t.startMinute}–{t.endMinute}m · {t.sentiment}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(data.insights?.length > 0 || data.recommendations?.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="size-4 text-teal-600" /> Insights</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(data.insights ?? []).map((x, i) => <p key={i} className="rounded bg-muted px-3 py-2">{x}</p>)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(data.recommendations ?? []).map((x, i) => <p key={i} className="rounded bg-teal/5 px-3 py-2">{x}</p>)}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
