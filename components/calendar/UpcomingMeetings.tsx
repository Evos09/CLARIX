"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Video, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Ev {
  id: string;
  title: string;
  startTime: string;
  attendees: string[];
  description: string | null;
  meeting: { id: string } | null;
}

function whenLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now.getTime() + 86400000).toDateString() === d.toDateString();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today ${time}`;
  if (tomorrow) return `Tomorrow ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

export function UpcomingMeetings() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  async function load() {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 30 * 86400000).toISOString();
    const r = await fetch(`/api/integrations/calendar/events?from=${from}&to=${to}`);
    if (r.ok) setEvents((await r.json()).slice(0, 5));
    setLoaded(true);
  }
  useEffect(() => { void load(); }, []);

  async function sync() {
    setSyncing(true);
    await fetch("/api/integrations/calendar/sync", { method: "POST" }).catch(() => {});
    await load();
    setSyncing(false);
  }

  if (loaded && events.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming</CardTitle>
        <button onClick={sync} title="Sync now" className="text-muted-foreground hover:text-teal-600">
          <RefreshCw className={cn("size-4", syncing && "animate-spin")} />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5">{whenLabel(e.startTime)}</span>
              {e.attendees.length > 0 && <span className="flex items-center gap-1"><Users className="size-3" /> {e.attendees.length}</span>}
              {e.description?.includes("Google Meet") && <span className="flex items-center gap-1 text-teal-600"><Video className="size-3" /> Meet</span>}
            </div>
            <p className="mt-1 truncate text-sm font-medium">{e.title}</p>
            <div className="mt-2">
              {e.meeting ? (
                <Link href={`/meetings/${e.meeting.id}`} className="text-xs text-teal-600 hover:underline">View Summary →</Link>
              ) : (
                <Link href={`/meetings/new?title=${encodeURIComponent(e.title)}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs")}>
                  Record After Meeting
                </Link>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
