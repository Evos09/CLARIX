"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  MessageSquare,
  TrendingUp,
  Smile,
  Users,
  Clock,
  HelpCircle,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

interface Overview {
  meetingCount: number;
  avgEngagement: number;
  avgParticipation: number;
  totalFillerWords: number;
  avgQuestionRate: number;
  avgDecisionRate: number;
  avgActionRate: number;
  totalMinutes: number;
  sentimentCounts: Record<string, number>;
  typeBreakdown: { name: string; value: number }[];
  engagementTrend: { date: string; engagement: number }[];
  topFillerWords: { word: string; count: number }[];
  recentAnalytics: {
    meetingId: string;
    title: string;
    date: string;
    engagement: number;
    participation: number;
    sentiment: string;
  }[];
}

const COLORS = ["#6d28d9", "#06b6d4", "#3b82f6", "#a855f7", "#f97316", "#ec4899", "#14b8a6"];
const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: "#10b981",
  NEUTRAL: "#6b7280",
  MIXED: "#f59e0b",
  TENSE: "#ef4444",
};

const SENTIMENT_EMOJI: Record<string, string> = {
  POSITIVE: "😊 Positive",
  NEUTRAL: "😐 Neutral",
  MIXED: "🤔 Mixed",
  TENSE: "😬 Tense",
};

function Stat({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description?: string;
  icon?: any;
}) {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md border border-border/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          {Icon && (
            <div className="rounded-lg bg-muted p-2 text-muted-foreground">
              <Icon className="size-4" />
            </div>
          )}
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground font-medium">{description}</p>}
      </CardContent>
    </Card>
  );
}

export function AnalyticsOverviewClient() {
  const [data, setData] = useState<Overview | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && (!data || data.meetingCount === 0)) {
    return <EmptyState icon="BarChart3" title="No analytics yet" description="Analytics insights will appear here once your meetings have been processed." />;
  }
  if (!data) return <p className="text-sm text-muted-foreground animate-pulse p-6">Loading analytics database...</p>;

  // Filter trend and records based on selection (client-side interactive feature)
  let filteredTrend = data.engagementTrend;
  if (filterType === "high") {
    filteredTrend = data.engagementTrend.filter((t) => t.engagement >= 75);
  } else if (filterType === "low") {
    filteredTrend = data.engagementTrend.filter((t) => t.engagement < 75);
  }

  // Aggregate sentiment data for rendering in Recharts
  const sentimentChartData = Object.entries(data.sentimentCounts).map(([name, value]) => ({
    name: SENTIMENT_EMOJI[name] || name,
    value,
    rawName: name,
  }));

  // AI Coaching Logic based on organizational aggregates
  const fillerRate = data.meetingCount ? Math.round(data.totalFillerWords / data.meetingCount) : 0;
  const showFillerWarning = fillerRate > 15;
  const showBalanceWarning = data.avgParticipation < 55;

  return (
    <div className="space-y-6">
      {/* Timeframe & Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Executive Team Intelligence</h2>
          <p className="text-xs text-muted-foreground">Rollup diagnostics and behavioral trends across your team's conversations.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Filter trend:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 rounded-md border border-input bg-card px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="all">All meetings</option>
            <option value="high">High engagement (≥75)</option>
            <option value="low">Needs improvement (&lt;75)</option>
          </select>
        </div>
      </div>

      {/* Main Diagnostic Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total Meetings" value={String(data.meetingCount)} description={`Total hours: ${Math.round(data.totalMinutes / 60)}`} icon={Calendar} />
        <Stat label="Avg Engagement" value={`${data.avgEngagement}%`} description="Diagnostic score out of 100" icon={TrendingUp} />
        <Stat label="Participation Balance" value={`${data.avgParticipation}%`} description={data.avgParticipation >= 60 ? "Balanced speaking patterns" : "One speaker dominating"} icon={Users} />
        <Stat label="Total Minutes Met" value={`${data.totalMinutes}m`} description="Active collaboration time" icon={Clock} />
      </div>

      {/* Advanced Interaction Rates */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
          <div className="rounded-full bg-blue-500/10 p-2.5 text-blue-600">
            <HelpCircle className="size-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.avgQuestionRate}</p>
            <p className="text-[11px] font-medium text-muted-foreground">Avg questions / meeting</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
          <div className="rounded-full bg-teal-500/10 p-2.5 text-teal-600">
            <CheckCircle2 className="size-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.avgDecisionRate}</p>
            <p className="text-[11px] font-medium text-muted-foreground">Avg decisions recorded</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/80 bg-muted/30 p-4">
          <div className="rounded-full bg-indigo-500/10 p-2.5 text-indigo-600">
            <MessageSquare className="size-4" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.avgActionRate}</p>
            <p className="text-[11px] font-medium text-muted-foreground">Avg action items generated</p>
          </div>
        </div>
      </div>

      {/* AI Coaching Tips & Communication Insights */}
      <Card className="border border-violet-100 bg-violet-50/15">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-violet-800">
            <Brain className="size-4 text-violet-700" />
            AI Communication Coach
          </CardTitle>
          <CardDescription className="text-[11px]">Real-time recommendations for team conversational health.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-foreground">
          {showBalanceWarning && (
            <div className="flex items-start gap-2.5 rounded border border-amber-200/60 bg-amber-50/10 p-2.5">
              <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-amber-800 font-semibold block">Speaking Balance Warning</strong>
                Your team's average participation score is currently skewed ({data.avgParticipation}% balance). Consider assigning explicit roles or implementing a round-robin format in standups to give quiet members speaking time.
              </div>
            </div>
          )}

          {showFillerWarning && (
            <div className="flex items-start gap-2.5 rounded border border-violet-200/60 bg-violet-50/20 p-2.5">
              <Lightbulb className="size-4 text-violet-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-violet-800 font-semibold block">Filler Word Coaching Tip</strong>
                The team averages {fillerRate} filler words per meeting. Urge presenters to pause for 1-2 seconds instead of filling silence with "like" or "uh". Silent pauses convey confidence and structure.
              </div>
            </div>
          )}

          {!showFillerWarning && !showBalanceWarning && (
            <div className="flex items-start gap-2.5 rounded border border-green-200/60 bg-green-50/10 p-2.5">
              <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <strong className="text-green-800 font-semibold block">Conversational Flow is Healthy</strong>
                Team speaking balance and speech pacing are within optimal target ranges. Great job maintaining an engaging, balanced, and articulate collaborative meeting environment!
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Engagement Trend</CardTitle>
            <CardDescription className="text-xs">Timeline of meeting engagement diagnostics over last 30 meetings.</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTrend.length === 0 ? (
              <p className="text-xs text-muted-foreground p-8 text-center">No trend points match the selected filter.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={filteredTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement" stroke="#6d28d9" strokeWidth={2.5} dot={{ r: 3, stroke: "#6d28d9", fill: "#ffffff", strokeWidth: 1.5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Meeting Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Meetings by Category</CardTitle>
            <CardDescription className="text-xs">Segmentation of analyzed meeting structures.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.typeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                  {data.typeBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[10px] font-medium text-muted-foreground">
              {data.typeBreakdown.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1">
                  <span className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Diagnostics Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Overall Sentiment Distribution</CardTitle>
            <CardDescription className="text-xs">Summary of baseline emotional tones across team discussions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sentimentChartData} margin={{ bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis allowDecimals={false} fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sentimentChartData.map((entry, index) => (
                    <Cell key={index} fill={SENTIMENT_COLORS[entry.rawName] || "#6d28d9"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Filler Words */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Filler Word Usage</CardTitle>
            <CardDescription className="text-xs">Top filler words detected and their total organizational count.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topFillerWords.length === 0 ? (
              <p className="text-xs text-muted-foreground p-8 text-center italic">No filler words registered in the database.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.topFillerWords} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="word" width={60} fontSize={11} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Meeting Scorecard List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent Meeting Diagnostics</CardTitle>
          <CardDescription className="text-xs">Detailed diagnostic results for your team's latest meetings.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 font-semibold border-b border-border/60">
                <tr>
                  <th className="p-4">Meeting Title</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Engagement</th>
                  <th className="p-4">Speaking Balance</th>
                  <th className="p-4 text-right">Sentiment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.recentAnalytics.map((m) => (
                  <tr key={m.meetingId} className="hover:bg-muted/20 transition-colors group">
                    <td className="p-4 font-medium">
                      <Link href={`/meetings/${m.meetingId}`} className="text-teal-600 hover:underline font-semibold block group-hover:text-teal-700">
                        {m.title}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{m.date}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{m.engagement}%</span>
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.engagement >= 75 ? "bg-green-500" : m.engagement >= 55 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${m.engagement}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${m.participation >= 60 ? "text-green-600" : "text-amber-600"}`}>
                        {m.participation}% {m.participation >= 60 ? "Balanced" : "Skewed"}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-muted-foreground">
                      <Badge className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground ring-border">
                        {SENTIMENT_EMOJI[m.sentiment] || m.sentiment}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
