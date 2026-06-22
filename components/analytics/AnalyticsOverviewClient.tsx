"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Overview {
  meetingCount: number;
  avgEngagement: number;
  avgParticipation: number;
  totalFillerWords: number;
  sentimentCounts: Record<string, number>;
  typeBreakdown: { name: string; value: number }[];
  engagementTrend: { date: string; engagement: number }[];
}

const COLORS = ["#00c8b4", "#0a1628", "#2563eb", "#9333ea", "#ea580c", "#db2777", "#0891b2"];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function AnalyticsOverviewClient() {
  const [data, setData] = useState<Overview | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && (!data || data.meetingCount === 0)) {
    return <EmptyState icon="BarChart3" title="No analytics yet" description="Open the Analytics tab on a completed meeting to generate insights. They roll up here." />;
  }
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Meetings analyzed" value={String(data.meetingCount)} />
        <Stat label="Avg engagement" value={`${data.avgEngagement}/100`} />
        <Stat label="Avg participation" value={`${data.avgParticipation}/100`} />
        <Stat label="Filler words" value={String(data.totalFillerWords)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Engagement trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data.engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="engagement" stroke="#00c8b4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Meetings by type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.typeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45}>
                  {data.typeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
