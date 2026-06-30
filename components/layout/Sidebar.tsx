"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  Music,
  BarChart3,
  ListTodo,
  Settings,
  CreditCard,
  Users,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";
import { PLANS, type PlanId } from "@/lib/stripe";

type NavItem = { href: string; label: string; icon: LucideIcon; badgeKey?: "openActions" };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/meetings", label: "Meetings", icon: Mic },
  { href: "/audio", label: "Audio Library", icon: Music },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/action-items", label: "Action Items", icon: ListTodo, badgeKey: "openActions" },
];


export function Sidebar({
  plan = "FREE",
  openActions = 0,
  meetingsThisMonth = 0,
}: {
  plan?: PlanId;
  openActions?: number;
  meetingsThisMonth?: number;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("clarix_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const handleToggleCollapse = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    localStorage.setItem("clarix_sidebar_collapsed", String(newValue));
  };

  const limit = PLANS[plan].meetingsPerMonth; // null = unlimited
  const pct = limit ? Math.min(100, Math.round((meetingsThisMonth / limit) * 100)) : 0;

  const linkClass = (href: string) =>
    cn(
      "flex items-center rounded-md py-2.5 text-[11px] font-medium uppercase tracking-wider font-mono transition-all duration-300",
      isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "justify-between px-3 w-full",
      isActive(href)
        ? "bg-accent/10 text-accent"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col bg-card py-5 transition-all duration-300 ease-in-out relative select-none border-r border-border",
        isCollapsed ? "w-[72px] px-2" : "w-60 px-4"
      )}
    >
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground z-10 cursor-pointer"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>

      {/* brand */}
      <Link
        href="/dashboard"
        className={cn(
          "mb-6 flex items-center gap-2.5 px-2 transition-all duration-300",
          isCollapsed ? "justify-center gap-0" : ""
        )}
      >
        <LogoMark size={30} />
        <span
          className={cn(
            "text-[18px] font-display font-normal tracking-tight text-foreground transition-all duration-300 whitespace-nowrap overflow-hidden",
            isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
          )}
        >
          CLARIX
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
        {NAV.map(({ href, label, icon: Icon, badgeKey }) => (
          <Link
            key={href}
            href={href}
            className={linkClass(href)}
            title={isCollapsed ? label : undefined}
          >
            <span className={cn("flex items-center w-full", isCollapsed ? "relative justify-center" : "")}>
              <Icon className="size-4 shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300 whitespace-nowrap overflow-hidden text-left",
                  isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3"
                )}
              >
                {label}
              </span>
              
              {/* Badge for collapsed state */}
              {isCollapsed && badgeKey === "openActions" && openActions > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white ring-2 ring-card animate-pulse">
                  {openActions}
                </span>
              )}
            </span>

            {/* Badge for expanded state */}
            {!isCollapsed && badgeKey === "openActions" && openActions > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                {openActions}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Settings pinned to bottom above usage meter */}
      <div className="mt-auto pt-2 shrink-0">
        <Link
          href="/settings"
          className={linkClass("/settings")}
          title={isCollapsed ? "Settings" : undefined}
        >
          <span className={cn("flex items-center w-full", isCollapsed ? "relative justify-center" : "gap-3")}>
            <Settings className="size-4 shrink-0" />
            <span
              className={cn(
                "transition-all duration-300 whitespace-nowrap overflow-hidden text-left",
                isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3"
              )}
            >
              Settings
            </span>
          </span>
        </Link>
      </div>

      {/* usage meter / plan card */}
      <div
        className={cn(
          "rounded-md border border-border bg-muted transition-all duration-300 overflow-hidden shrink-0",
          isCollapsed ? "h-0 opacity-0 p-0 border-0 mt-0" : "p-3.5 mt-4"
        )}
      >
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>{PLANS[plan].name} plan</span>
          <span className="font-semibold text-foreground">
            {limit ? `${meetingsThisMonth} / ${limit}` : "Unlimited"}
          </span>
        </div>
        {limit ? (
          <>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted-foreground/20">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <Link
              href="/settings/billing"
              className="block rounded-md bg-accent py-2 text-center text-[12.5px] font-bold text-white transition hover:bg-accent/90"
            >
              Upgrade plan
            </Link>
          </>
        ) : (
          <p className="text-[12px] text-muted-foreground">Meetings this month: {meetingsThisMonth}</p>
        )}
      </div>
    </aside>
  );
}
