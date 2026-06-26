"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionItem {
  id: string;
  task: string;
  owner: string | null;
  dueDate: string | null;
  priority: string | null;
  completed: boolean;
}

export function PublicChecklist({
  initialActionItems,
  shareToken,
}: {
  initialActionItems: ActionItem[];
  shareToken: string;
}) {
  const [items, setItems] = useState<ActionItem[]>(initialActionItems);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleItem = async (itemId: string, currentStatus: boolean) => {
    setUpdatingId(itemId);
    const newStatus = !currentStatus;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, completed: newStatus } : item))
    );

    try {
      const res = await fetch(`/api/public/meetings/${shareToken}/action-items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionItemId: itemId, completed: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      
      // Ensure local state matches server response
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, completed: data.completed } : item))
      );
    } catch (err) {
      console.error(err);
      // Revert optimistic update on failure
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, completed: currentStatus } : item))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const PRIORITY_CLASSES: Record<string, string> = {
    HIGH: "bg-red-50 text-red-700 border-red-200",
    MEDIUM: "bg-amber-50 text-amber-800 border-amber-200",
    LOW: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          No action items found for this meeting.
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-4 p-4.5 transition-colors",
                item.completed ? "bg-muted/20" : "hover:bg-muted/10"
              )}
            >
              <button
                onClick={() => toggleItem(item.id, item.completed)}
                disabled={updatingId === item.id}
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-lg border text-white transition",
                  item.completed
                    ? "bg-teal border-teal shadow-sm"
                    : "border-border hover:border-muted-foreground bg-surface",
                  updatingId === item.id && "opacity-60 cursor-not-allowed"
                )}
              >
                {updatingId === item.id ? (
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                ) : (
                  item.completed && <Check className="size-3.5 stroke-[3px]" />
                )}
              </button>

              <div className="min-w-0 flex-1 space-y-1">
                <p
                  className={cn(
                    "text-[15px] font-medium leading-normal text-foreground transition-all",
                    item.completed && "line-through text-muted-foreground"
                  )}
                >
                  {item.task}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {item.owner && (
                    <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded">
                      {item.owner}
                    </span>
                  )}
                  {item.dueDate && <span>Due: {item.dueDate}</span>}
                  {item.priority && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 border text-[10px] font-semibold tracking-wide uppercase",
                        PRIORITY_CLASSES[item.priority] ?? PRIORITY_CLASSES.LOW
                      )}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
