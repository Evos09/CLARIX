"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  Music,
  ListTodo,
  Settings,
  CreditCard,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "./Logo";
import { PlanBadge } from "./PlanBadge";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/stripe";

type NavItem = { href: string; label: string; icon: LucideIcon; badgeKey?: "openActions" };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/meetings", label: "Meetings", icon: Mic },
  { href: "/audio", label: "Audio Library", icon: Music },
  { href: "/action-items", label: "Action Items", icon: ListTodo, badgeKey: "openActions" },
];

const FOOTER_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/team", label: "Team", icon: Users },
];

export function Sidebar({
  plan = "FREE",
  openActions = 0,
}: {
  plan?: PlanId;
  openActions?: number;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center px-5 border-b border-border">
        <Logo href="/dashboard" />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon, badgeKey }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(href) ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className="size-4" />
              {label}
            </span>
            {badgeKey === "openActions" && openActions > 0 && (
              <span className="rounded-full bg-teal px-2 py-0.5 text-xs font-semibold text-navy">
                {openActions}
              </span>
            )}
          </Link>
        ))}
        <div className="my-3 border-t border-border" />
        {FOOTER_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive(href) ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <PlanBadge plan={plan} />
      </div>
    </aside>
  );
}
