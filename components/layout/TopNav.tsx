"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";

/**
 * Slim utility bar at the top of every dashboard page. The page's real title
 * lives in PageHeader below — this bar only carries quiet context (breadcrumb)
 * plus the global actions, so pages no longer show a doubled-up headline.
 */
export function TopNav({
  title = "Dashboard",
  showNewMeeting = true,
}: {
  title?: string;
  showNewMeeting?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
        <span className="text-muted-foreground">Workspace</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="truncate font-medium text-foreground">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        {showNewMeeting && (
          <Link
            href="/meetings/new"
            className={cn(buttonVariants({ variant: "accent", size: "sm" }), "rounded-lg")}
          >
            <Plus className="size-4" />
            New meeting
          </Link>
        )}
        <UserMenu />
      </div>
    </header>
  );
}
