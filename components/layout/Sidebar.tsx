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
  Repeat,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LogoMark } from "./LogoMark";
import { PLANS, type PlanId } from "@/lib/stripe";
import { SidebarUserMenu } from "./SidebarUserMenu";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

type NavItem = { href: string; label: string; icon: LucideIcon; badgeKey?: "openActions" };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meetings", label: "Meetings", icon: Mic },
  { href: "/action-items", label: "Action items", icon: ListTodo, badgeKey: "openActions" },
  { href: "/series", label: "Series", icon: Repeat },
  { href: "/chat", label: "Clarix Chat", icon: MessageSquare },
  { href: "/audio", label: "Audio library", icon: Music },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
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
      "group relative flex items-center rounded-lg py-2 text-[13px] font-medium transition-colors",
      isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "justify-between px-2.5 w-full",
      isActive(href)
        ? "bg-accent/[0.08] text-accent"
        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
    );

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col bg-card py-4 transition-all duration-300 ease-in-out relative select-none border-r border-border",
        isCollapsed ? "w-[68px] px-2" : "w-[232px] px-3"
      )}
    >
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-[26px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground z-10 cursor-pointer"
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
          "mb-5 flex items-center gap-2.5 px-1.5 transition-all duration-300",
          isCollapsed ? "justify-center gap-0 px-0" : ""
        )}
      >
        <LogoMark size={28} />
        <span
          className={cn(
            "text-[15px] font-semibold tracking-tight text-foreground transition-all duration-300 whitespace-nowrap overflow-hidden",
            isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
          )}
        >
          CLARIX
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
        {NAV.map(({ href, label, icon: Icon, badgeKey }) => (
          <Link
            key={href}
            href={href}
            className={linkClass(href)}
            title={isCollapsed ? label : undefined}
          >
            <span className={cn("flex items-center w-full", isCollapsed ? "relative justify-center" : "")}>
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive(href) ? "text-accent" : "text-muted-foreground/80 group-hover:text-foreground"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-300 whitespace-nowrap overflow-hidden text-left",
                  isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-2.5"
                )}
              >
                {label}
              </span>

              {/* Badge for collapsed state */}
              {isCollapsed && badgeKey === "openActions" && openActions > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white ring-2 ring-card">
                  {openActions}
                </span>
              )}
            </span>

            {/* Badge for expanded state */}
            {!isCollapsed && badgeKey === "openActions" && openActions > 0 && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                  isActive(href) ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                )}
              >
                {openActions}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom: usage meter + account menu (Settings lives in the user menu) */}
      <div className="mt-auto shrink-0 pt-2">
        <div
          className={cn(
            "rounded-lg bg-muted/60 transition-all duration-300 overflow-hidden",
            isCollapsed ? "h-0 opacity-0 p-0 mb-0 mt-0" : "p-3 mb-2"
          )}
        >
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">{PLANS[plan].name} plan</span>
            <span className="font-medium tabular-nums text-foreground">
              {limit ? `${meetingsThisMonth} / ${limit}` : "Unlimited"}
            </span>
          </div>
          {limit ? (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted-foreground/15">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground/80">
              {meetingsThisMonth} meeting{meetingsThisMonth === 1 ? "" : "s"} this month
            </p>
          )}
        </div>

        {hasClerk ? (
          <SidebarUserMenu
            planName={PLANS[plan].name}
            isCollapsed={isCollapsed}
            showUpgrade={plan !== "ENTERPRISE" && plan !== "BUSINESS"}
          />
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg p-2">
            <span className="grid size-8 place-items-center rounded-full bg-accent/10 text-[11px] font-semibold text-accent">
              ME
            </span>
            {!isCollapsed && <span className="text-[13px] font-medium text-foreground">Account</span>}
          </div>
        )}
      </div>
    </aside>
  );
}
