import type { ReactNode } from "react";

/**
 * Editorial page header for dashboard pages — the same visual language as the
 * marketing site and the dashboard hero: pulsing eyebrow chip, display headline
 * with an italic serif accent word, muted description, optional actions slot.
 *
 * Usage:
 *   <PageHeader eyebrow="Analytics" title={<>Your team, <Accent>understood</Accent>.</>}
 *               description="…" />
 */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="font-display font-normal italic text-accent">{children}</span>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          <span className="size-1.5 rounded-full bg-accent" /> {eyebrow}
        </span>
        <h1 className="mt-3 text-[26px] font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="shrink-0 self-start sm:self-auto">{children}</div>}
    </header>
  );
}
