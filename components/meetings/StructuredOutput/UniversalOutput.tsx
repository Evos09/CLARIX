import { CheckCircle2, HelpCircle, Flag, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BaseOutput, ActionItem } from "@/lib/outputTypes";

const PRIORITY: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 ring-red-600/20",
  MEDIUM: "bg-amber-100 text-amber-800 ring-amber-600/20",
  LOW: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

const SENTIMENT: Record<string, string> = {
  POSITIVE: "bg-green-100 text-green-700 ring-green-600/20",
  NEUTRAL: "bg-gray-100 text-gray-600 ring-gray-500/20",
  TENSE: "bg-red-100 text-red-700 ring-red-600/20",
};

export function UniversalOutput({ output }: { output: BaseOutput }) {
  const actionItems = output.actionItems ?? [];
  const decisions = output.keyDecisions ?? [];
  const questions = output.openQuestions ?? [];
  const topics = output.topics ?? [];

  return (
    <div className="space-y-6">
      {output.tldr && (
        <div className="rounded-lg border border-teal/30 bg-teal/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">TL;DR</p>
          <p className="mt-1 text-sm">{output.tldr}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {output.sentiment && (
          <Badge className={SENTIMENT[output.sentiment] ?? SENTIMENT.NEUTRAL}>
            <Flag className="size-3" /> {output.sentiment}
          </Badge>
        )}
        {output.followUpDate && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <CalendarClock className="size-4" /> Follow up: {output.followUpDate}
          </span>
        )}
      </div>

      {actionItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Action Items</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {actionItems.map((a: ActionItem, i) => (
              <div key={i} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.task}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.owner || "Unassigned"}{a.dueDate ? ` · due ${a.dueDate}` : ""}
                  </p>
                </div>
                {a.priority && <Badge className={PRIORITY[a.priority] ?? PRIORITY.LOW}>{a.priority}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {decisions.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Key Decisions</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {decisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-600" />{d}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {questions.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Open Questions</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <HelpCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />{q}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topics.map((t, i) => (
            <span key={i} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
