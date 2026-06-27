"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";

export function TopNav({
  title = "Dashboard",
  showNewMeeting = true,
}: {
  title?: string;
  showNewMeeting?: boolean;
}) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        {showNewMeeting && (
          <Link
            href="/meetings/new"
            className={cn(buttonVariants({ variant: "accent", size: "sm" }))}
          >
            <Plus className="size-4" />
            New Meeting
          </Link>
        )}
        <UserMenu />
      </div>
    </header>
  );
}
