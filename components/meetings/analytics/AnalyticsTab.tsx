"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, HelpCircle, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SpeakerStat {
  speaker: string;
  talkPercent?: number;
  wordCount?: number;
  fillerWords?: number;
  longestMonologueSeconds?: number;
}

interface Analytics {
  overallEngagement: number;
  participationBalance: number;
  overallSentiment: string;
  fillerWordCount: number;
  questionRate?: number;
  decisionRate?: number;
  actionRate?: number;
  sentimentByMinute: { minute: number; score: number }[];
  speakerStats: SpeakerStat[];
  energyTimeline: { minute: number; energy: number }[];
  topicTimeline: { topic: string; startMinute: number; endMinute: number; sentiment: string }[];
  fillerWordDetails?: Record<string, number>;
  insights: string[];
  recommendations: string[];
}

const SENTIMENT_EMOJI: Record<string, string> = {
  POSITIVE: "😊 Positive",
  NEUTRAL: "😐 Neutral",
  MIXED: "🤔 Mixed",
  TENSE: "😬 Tense",
};

const BAR_COLORS = ["#6d28d9", "#06b6d4", "#2563eb", "#9333ea", "#ea580c", "#db2777"];

function Metric({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon?: any }) {
  return (
    <Card className="border border-border/80 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          {Icon && <Icon className="size-4 text-muted-foreground" />}
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground font-medium">{hint}</p>}
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
        if (!r.ok) {
          setError(d.error ?? "Failed");
          setState("error");
          return;
        }
        if (d.notReady) {
          setState("notReady");
          return;
        }
        setData(d);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [meetingId]);

  if (state === "loading") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Running advanced meeting diagnostics…
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (state === "notReady") {
    return (
      <Card className="border border-dashed border-border p-6 text-center">
        <CardContent className="space-y-2">
          <Loader2 className="mx-auto size-6 animate-spin text-teal-600" />
          <p className="text-sm font-semibold text-foreground">Analyzing meeting transcript...</p>
          <p className="text-xs text-muted-foreground">Deep diagnostic reports will be available shortly after meeting processing completes.</p>
        </CardContent>
      </Card>
    );
  }

  if (state === "error" || !data) {
    return (
      <Card className="border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="size-5 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">Could not load analytics</p>
            <p className="text-xs text-destructive/80 mt-0.5">{error || "Please verify the meeting audio has processed."}</p>
          </div>
        </div>
      </Card>
    );
  }

  const speakerData = (data.speakerStats ?? []).map((s) => ({
    name: /^speaker\b/i.test((s.speaker ?? "").trim()) ? s.speaker.trim() : s.speaker,
    value: Math.round(s.talkPercent ?? 0),
    words: s.wordCount ?? 0,
    filler: s.fillerWords ?? 0,
  }));

  const fillerDetails = data.fillerWordDetails ? Object.entries(data.fillerWordDetails) : [];

  return (
    <div className="space-y-6">
      {/* Primary KPI Indicators */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Engagement" value={`${Math.round(data.overallEngagement)}%`} hint="Diagnostic score out of 100" />
        <Metric label="Participation Balance" value={`${Math.round(data.participationBalance)}%`} hint={data.participationBalance >= 60 ? "Balanced speaking patterns" : "Skewed speaking patterns"} />
        <Metric label="Overall Sentiment" value={SENTIMENT_EMOJI[data.overallSentiment] ?? data.overallSentiment} />
        <Metric label="Filler Words" value={`${data.fillerWordCount}`} hint="Total filler words used" />
      </div>

      {/* Advanced Interaction Rates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/20 p-4">
          <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
            <HelpCircle className="size-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{data.questionRate ?? 0}</p>
            <p className="text-[10px] font-medium text-muted-foreground">Questions asked</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/20 p-4">
          <div className="rounded-full bg-teal-500/10 p-2 text-teal-600">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{data.decisionRate ?? 0}</p>
            <p className="text-[10px] font-medium text-muted-foreground">Decisions logged</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/20 p-4">
          <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-600">
            <MessageSquare className="size-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{data.actionRate ?? 0}</p>
            <p className="text-[10px] font-medium text-muted-foreground">Action items generated</p>
          </div>
        </div>
      </div>

      {/* Speaker Breakdown Section */}
      {speakerData.length > 0 && (
        <Card className="border border-border/85">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Speaker Breakdown</CardTitle>
            <CardDescription className="text-xs">Comparative talk share percentage and verbal diagnostics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResponsiveContainer width="100%" height={Math.max(100, speakerData.length * 40)}>
              <BarChart data={speakerData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" domain={[0, 100]} unit="%" fontSize={11} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" width={80} fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
                  {speakerData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Detailed Speaker Diagnostic Table */}
            <div className="overflow-x-auto border border-border/60 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 font-semibold border-b border-border/60">
                  <tr>
                    <th className="p-3">Speaker</th>
                    <th className="p-3">Talk Share</th>
                    <th className="p-3">Word Count</th>
                    <th className="p-3">Filler Words</th>
                    <th className="p-3 text-right">Longest Monologue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.speakerStats.map((s, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{s.speaker}</td>
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="w-8 shrink-0">{Math.round(s.talkPercent ?? 0)}%</span>
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-violet-600 rounded-full" style={{ width: `${s.talkPercent}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{s.wordCount ?? 0} words</td>
                      <td className="p-3 text-muted-foreground">{s.fillerWords ?? 0} filler words</td>
                      <td className="p-3 text-right font-medium text-muted-foreground">{s.longestMonologueSeconds ? `${s.longestMonologueSeconds}s` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timelines Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sentiment Timeline */}
        {data.sentimentByMinute?.length > 0 && (
          <Card className="border border-border/85">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Sentiment Over Time</CardTitle>
              <CardDescription className="text-xs">Dynamic tone index (0 = tense, 1 = positive) throughout the call.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.sentimentByMinute}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="minute" unit="m" fontSize={11} stroke="#94a3b8" />
                  <YAxis domain={[0, 1]} fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#6d28d9" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Energy Timeline */}
        {data.energyTimeline?.length > 0 && (
          <Card className="border border-border/85">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Energy Timeline</CardTitle>
              <CardDescription className="text-xs">Voice activity volume and speech pacing diagnostics (0-100).</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.energyTimeline}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="minute" unit="m" fontSize={11} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="energy" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#energyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filler Words Breakdown Details */}
      {fillerDetails.length > 0 && (
        <Card className="border border-border/85">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Filler Word Statistics</CardTitle>
            <CardDescription className="text-xs">Identified pacing particles and their total frequency.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fillerDetails.map(([word, count]) => (
                <div
                  key={word}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold">"{word}"</span>
                  <span className="rounded-full bg-violet-100 text-violet-700 px-1.5 py-0.5 text-[10px] font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Topic Segments */}
      {data.topicTimeline?.length > 0 && (
        <Card className="border border-border/85">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Conversational Topics Timeline</CardTitle>
            <CardDescription className="text-xs">Sequential topics identified during the meeting and their emotional tone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topicTimeline.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border/80 px-4 py-3 text-xs hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{t.topic}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground font-medium">
                  <span>{t.startMinute}m – {t.endMinute}m</span>
                  <Badge className="text-[10px] capitalize px-2 py-0.5 font-medium bg-muted text-muted-foreground ring-border">
                    {t.sentiment.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Insights & Recommendations */}
      {(data.insights?.length > 0 || data.recommendations?.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.insights?.length > 0 && (
            <Card className="border border-border/85">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="size-4 text-violet-600" />
                  Key Insights
                </CardTitle>
                <CardDescription className="text-xs">Observational highlights from team behaviors during this call.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {data.insights.map((x, i) => (
                  <p key={i} className="rounded-md bg-muted/40 border border-border/40 px-3.5 py-2.5 leading-relaxed text-foreground font-medium">
                    {x}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          {data.recommendations?.length > 0 && (
            <Card className="border border-border/85">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Coaching Recommendations</CardTitle>
                <CardDescription className="text-xs">Actionable advice to improve team conversational flow next time.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {data.recommendations.map((x, i) => (
                  <p key={i} className="rounded-md bg-teal-50/15 border border-teal-100/60 px-3.5 py-2.5 leading-relaxed text-foreground font-medium">
                    {x}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
