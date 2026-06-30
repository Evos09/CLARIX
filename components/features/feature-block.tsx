import type { ReactNode } from "react";

export function FeatureBlock({
  index,
  eyebrow,
  title,
  description,
  bullets,
  visual,
  flip = false,
}: {
  index: number;
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
  visual: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center py-16 lg:py-24 border-t border-foreground/10">
      <div className={flip ? "lg:order-2" : ""}>
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-xs text-muted-foreground">{String(index).padStart(2, "0")}</span>
          <span className="text-xs font-mono uppercase tracking-widest text-brand">{eyebrow}</span>
        </div>
        <h2 className="font-display text-3xl lg:text-4xl tracking-tight text-balance mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground leading-relaxed text-pretty mb-6">{description}</p>
        {bullets && (
          <ul className="space-y-2.5">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={flip ? "lg:order-1" : ""}>{visual}</div>
    </div>
  );
}
