import { Card, CardContent } from "@/components/ui/card";
import { icons } from "lucide-react";

export interface Stat {
  label: string;
  value: string;
  icon: string;
  hint?: string;
}

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = icons[s.icon as keyof typeof icons] ?? icons.Activity;
        return (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid size-10 place-items-center rounded-md bg-teal/10 text-teal-600">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
                {s.hint && <p className="text-xs text-muted-foreground">{s.hint}</p>}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
