import type { ReactNode } from "react";

/**
 * Compact, professional page header for dashboard pages: functional title,
 * one-line muted description, actions on the right. The old editorial hero
 * (eyebrow chip + serif italic headline) was retired — `eyebrow` is now the
 * page title and the decorative `title` prop is accepted but ignored so
 * existing pages keep compiling.
 */
export function Accent({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function PageHeader({
  eyebrow,
  description,
  children,
}: {
  eyebrow: string;
  title?: ReactNode; // legacy editorial headline — no longer rendered
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          {eyebrow}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">{children}</div>}
    </header>
  );
}
