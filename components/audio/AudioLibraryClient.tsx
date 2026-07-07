"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Play, Trash2, RefreshCw, FileText, AlertTriangle } from "lucide-react";
import { MeetingTypeBadge } from "@/components/meetings/MeetingTypeBadge";
import { StatusBadge } from "@/components/meetings/StatusBadge";
import { formatDuration } from "@/lib/utils";

interface Item {
  id: string;
  title: string;
  audioFilename: string | null;
  audioSize: number | null;
  duration: number | null;
  status: string;
  createdAt: string;
  meetingType: string;
  playbackUrl: string | null;
}
interface Storage { used: number; limit: number | null; plan: string }

function fmtBytes(n: number | null): string {
  if (!n) return "—";
  const u = ["B", "KB", "MB", "GB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${u[i]}`;
}

export function AudioLibraryClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [storage, setStorage] = useState<Storage | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [openPlayer, setOpenPlayer] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const p = new URLSearchParams({ sort });
      if (search) p.set("search", search);
      fetch(`/api/audio?${p.toString()}`)
        .then((r) => (r.ok ? r.json() : { items: [], storage: null }))
        .then((d) => { setItems(d.items); setStorage(d.storage); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 150);
    return () => clearTimeout(t);
  }, [search, sort]);

  async function reload() {
    const p = new URLSearchParams({ sort });
    if (search) p.set("search", search);
    const r = await fetch(`/api/audio?${p.toString()}`);
    if (r.ok) { const d = await r.json(); setItems(d.items); setStorage(d.storage); }
  }

  async function del(id: string) {
    if (!confirm("Delete this recording? This cannot be undone.")) return;
    setItems((x) => x.filter((i) => i.id !== id));
    await fetch(`/api/audio/${id}`, { method: "DELETE" }).catch(() => {});
    void reload();
  }
  async function reprocess(id: string) {
    const t = prompt("Re-process as which meeting type? (e.g. STANDUP, SALES_CALL, GENERAL)", "GENERAL");
    if (!t) return;
    await fetch(`/api/audio/${id}/reprocess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingType: t.toUpperCase() }),
    }).catch(() => {});
    void reload();
  }

  const pct = storage && storage.limit ? Math.min(100, (storage.used / storage.limit) * 100) : 0;
  const meterColor = pct > 95 ? "bg-destructive" : pct > 80 ? "bg-amber-500" : "bg-teal";

  return (
    <div className="space-y-5">
      {storage && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Storage</span>
            <span className="text-muted-foreground">
              {fmtBytes(storage.used)} {storage.limit ? `of ${fmtBytes(storage.limit)}` : "(unlimited)"} used
            </span>
          </div>
          {storage.limit && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className={`h-full ${meterColor}`} style={{ width: `${pct}%` }} />
            </div>
          )}
          {pct > 95 && (
            <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="size-3" /> Storage almost full. Delete recordings or upgrade to continue.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recordings…" className="h-9 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm transition focus:border-accent focus:outline-none" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 cursor-pointer rounded-full border border-border bg-card px-4 text-sm transition hover:border-accent/40">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="longest">Longest</option>
          <option value="shortest">Shortest</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No recordings yet.</p>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((it) => (
            <div key={it.id} className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{it.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{it.audioFilename ?? "recording"}</p>
                </div>
                <MeetingTypeBadge typeId={it.meetingType} />
                <StatusBadge status={it.status} />
                <span className="text-xs text-muted-foreground">{formatDuration(it.duration ?? 0)}</span>
                <span className="text-xs text-muted-foreground">{fmtBytes(it.audioSize)}</span>
                <div className="flex items-center gap-1">
                  {it.playbackUrl && (
                    <button onClick={() => setOpenPlayer(openPlayer === it.id ? null : it.id)} title="Play" className="grid size-8 place-items-center rounded hover:bg-muted">
                      <Play className="size-4" />
                    </button>
                  )}
                  <Link href={`/meetings/${it.id}`} title="View summary" className="grid size-8 place-items-center rounded hover:bg-muted">
                    <FileText className="size-4" />
                  </Link>
                  <button onClick={() => reprocess(it.id)} title="Re-process" className="grid size-8 place-items-center rounded hover:bg-muted">
                    <RefreshCw className="size-4" />
                  </button>
                  <button onClick={() => del(it.id)} title="Delete" className="grid size-8 place-items-center rounded hover:bg-muted">
                    <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
              {openPlayer === it.id && it.playbackUrl && (
                <audio controls autoPlay src={it.playbackUrl} className="mt-3 w-full">
                  <track kind="captions" />
                </audio>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
