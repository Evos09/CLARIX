"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { Settings, LogOut, Sparkles, LifeBuoy, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarUserMenu({
  planName,
  isCollapsed = false,
  showUpgrade = true,
}: {
  planName: string;
  isCollapsed?: boolean;
  showUpgrade?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const name =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = name.trim().slice(0, 2).toUpperCase();

  const item =
    "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <div ref={ref} className="relative shrink-0">
      {open && !isCollapsed && (
        <div className="absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-md border border-border bg-card py-1 shadow-lg">
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
          </div>
          <Link href="/settings" onClick={() => setOpen(false)} className={item}>
            <Settings className="size-4" /> Settings
          </Link>
          {showUpgrade && (
            <Link
              href="/settings/billing"
              onClick={() => setOpen(false)}
              className={cn(item, "text-accent hover:text-accent")}
            >
              <Sparkles className="size-4" /> Upgrade plan
            </Link>
          )}
          <Link href="/contact" onClick={() => setOpen(false)} className={item}>
            <LifeBuoy className="size-4" /> Get help
          </Link>
          <div className="my-1 border-t border-border" />
          <button onClick={() => signOut({ redirectUrl: "/" })} className={item}>
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-muted",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? name : undefined}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/10 text-[11px] font-semibold uppercase text-accent">
          {initials}
        </span>
        {!isCollapsed && (
          <>
            <span className="flex min-w-0 flex-1 flex-col text-left">
              <span className="truncate text-[13px] font-medium text-foreground">{name}</span>
              <span className="truncate text-[11px] text-muted-foreground">{planName} plan</span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </button>
    </div>
  );
}
