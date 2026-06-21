"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  task: string;
  owner: string | null;
  dueDate: string | null;
  priority: string | null;
  completed: boolean;
  meeting: { id: string; title: string };
}

const PRIORITY: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 ring-red-600/20",
  MEDIUM: "bg-amber-100 text-amber-800 ring-amber-600/20",
  LOW: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

export function ActionItemsClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (priority) params.set("priority", priority);
    if (status) params.set("completed", status);
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/action-items?${params.toString()}`);
        const data = res.ok ? await res.json() : [];
        if (active) setItems(data);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [priority, status]);

  async function toggle(item: Item) {
    setItems((arr) => arr.map((x) => (x.id === item.id ? { ...x, completed: !x.completed } : x)));
    await fetch(`/api/action-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !item.completed }),
    }).catch(() => {});
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
          <option value="">All statuses</option>
          <option value="false">Open</option>
          <option value="true">Completed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState icon="ListTodo" title="No action items" description="Action items extracted across your meetings appear here." />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-4">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggle(item)}
                  className="mt-1 size-4 accent-teal-600"
                />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", item.completed && "text-muted-foreground line-through")}>{item.task}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.owner || "Unassigned"}</span>
                    {item.dueDate && <span>· due {item.dueDate}</span>}
                    <Link href={`/meetings/${item.meeting.id}`} className="text-teal-600 hover:underline">
                      {item.meeting.title}
                    </Link>
                  </div>
                </div>
                {item.priority && <Badge className={PRIORITY[item.priority] ?? PRIORITY.LOW}>{item.priority}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
