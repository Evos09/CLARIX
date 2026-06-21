import { Badge } from "@/components/ui/badge";

const MAP: Record<string, { label: string; cls: string }> = {
  UPLOADING: { label: "Uploading", cls: "bg-slate-100 text-slate-600 ring-slate-500/20" },
  TRANSCRIBING: { label: "Transcribing", cls: "bg-blue-100 text-blue-700 ring-blue-600/20" },
  PROCESSING: { label: "Analyzing", cls: "bg-amber-100 text-amber-800 ring-amber-600/20" },
  COMPLETE: { label: "Complete", cls: "bg-green-100 text-green-700 ring-green-600/20" },
  ERROR: { label: "Error", cls: "bg-red-100 text-red-700 ring-red-600/20" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? MAP.UPLOADING;
  return <Badge className={s.cls}>{s.label}</Badge>;
}
