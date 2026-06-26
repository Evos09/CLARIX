import { Scale, FileText, Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KeyStatement {
  speaker: string;
  statement: string;
  significance: string;
}

interface TimelineEntry {
  date: string;
  event: string;
}

interface LegalOutputProps {
  meetingId: string;
  output: {
    summary?: string;
    keyStatements?: KeyStatement[];
    exhibits?: string[];
    discoveryItems?: string[];
    timelineEntries?: TimelineEntry[];
  };
  isDemo?: boolean;
}

export function LegalOutput({ output }: LegalOutputProps) {
  const summary = output.summary ?? "";
  const keyStatements = output.keyStatements ?? [];
  const exhibits = output.exhibits ?? [];
  const discoveryItems = output.discoveryItems ?? [];
  const timelineEntries = output.timelineEntries ?? [];

  return (
    <div className="space-y-6">
      {/* Overview / Case Summary */}
      {summary && (
        <Card className="border-l-4 border-l-violet-600 bg-violet-50/10">
          <CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700 mb-1 flex items-center gap-1.5">
              <Scale className="size-3.5" /> Deposition Executive Summary
            </p>
            <p className="text-sm text-foreground/95 leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Case Timeline */}
      {timelineEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Gavel className="size-4 text-muted-foreground" />
              Deposition Timeline & Fact Log
            </CardTitle>
          </CardHeader>
          <CardContent className="relative pl-6 border-l-2 border-muted/80 ml-3 space-y-6">
            {timelineEntries.map((entry, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[31px] top-1.5 block size-3.5 rounded-full border-2 border-background bg-violet-600" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-violet-700 tracking-wider font-mono">
                    {entry.date}
                  </span>
                  <p className="text-sm text-foreground font-medium">{entry.event}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Key Admissions / Statements */}
      {keyStatements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Key Testimony & Admissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {keyStatements.map((ks, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-foreground">
                    Witness: {ks.speaker}
                  </span>
                  <Badge className="bg-amber-50 text-amber-800 ring-amber-600/20 text-xs font-semibold">
                    Admissive Segment
                  </Badge>
                </div>
                <blockquote className="border-l-2 border-amber-400 pl-3 italic text-sm text-foreground/90">
                  &ldquo;{ks.statement}&rdquo;
                </blockquote>
                {ks.significance && (
                  <div className="text-xs text-muted-foreground pt-1">
                    <strong className="text-foreground">Legal Significance:</strong> {ks.significance}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Exhibits and Discovery */}
      <div className="grid gap-6 md:grid-cols-2">
        {exhibits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                Referenced Exhibits ({exhibits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border text-sm">
                {exhibits.map((ex, idx) => (
                  <li key={idx} className="py-2.5 flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground bg-muted py-0.5 px-2 rounded">
                      EX-{idx + 1}
                    </span>
                    <span className="font-medium text-foreground">{ex}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {discoveryItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                Open Discovery / Actionable Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm">
                {discoveryItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="size-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
