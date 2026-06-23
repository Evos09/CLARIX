"use client";

import { Apple, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { isDesktop } from "@/lib/desktop";
import { cn } from "@/lib/utils";

export function DesktopAppCard() {
  return (
    <Card>
      <CardHeader><CardTitle>CLARIX for Desktop</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          A native menu-bar app for Mac and Windows — global shortcut to start recording from anywhere, and
          notifications when a meeting is ready.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none opacity-60")} aria-disabled="true">
            <Apple className="size-4" /> Mac
          </span>
          <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none opacity-60")} aria-disabled="true">
            <Monitor className="size-4" /> Windows
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">Coming soon</span>
        </div>
        <p className="text-xs text-muted-foreground">Global shortcut: <kbd className="rounded border border-border px-1">Cmd/Ctrl+Shift+R</kbd> to start recording from any app.</p>
        {isDesktop() && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-teal-600" /> Launch CLARIX on startup
          </label>
        )}
      </CardContent>
    </Card>
  );
}
