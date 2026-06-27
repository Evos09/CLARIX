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

const FOOTER_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
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
      "flex items-center rounded-[10px] py-2.5 text-sm font-medium transition-all duration-300",
      isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "justify-between px-3 w-full",
      isActive(href)
        ? "bg-teal/15 text-white"
        : "text-white/60 hover:bg-white/5 hover:text-white",
    );

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col bg-navy py-5 transition-all duration-300 ease-in-out relative select-none border-r border-white/5",
        isCollapsed ? "w-[72px] px-2" : "w-60 px-4"
      )}
    >
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={handleToggleCollapse}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-navy text-white/70 shadow-md transition hover:bg-white/10 hover:text-white z-10 cursor-pointer"
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
            "text-[18px] font-extrabold tracking-tight text-white transition-all duration-300 whitespace-nowrap overflow-hidden",
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
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal text-[9px] font-bold text-white ring-2 ring-navy animate-pulse">
                  {openActions}
                </span>
              )}
            </span>

            {/* Badge for expanded state */}
            {!isCollapsed && badgeKey === "openActions" && openActions > 0 && (
              <span className="rounded-full bg-teal px-2 py-0.5 text-xs font-semibold text-white">
                {openActions}
              </span>
            )}
          </Link>
        ))}
        
        <div className="my-3 border-t border-white/10 shrink-0" />
        
        {FOOTER_NAV.map(({ href, label, icon: Icon }) => (
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
            </span>
          </Link>
        ))}
      </nav>

      {/* usage meter / plan card */}
      <div
        className={cn(
          "rounded-xl border border-white/10 bg-white/[0.04] transition-all duration-300 overflow-hidden shrink-0",
          isCollapsed ? "h-0 opacity-0 p-0 border-0 mt-0" : "p-3.5 mt-4"
        )}
      >
        <div className="mb-2 flex justify-between text-xs text-white/70">
          <span>{PLANS[plan].name} plan</span>
          <span className="font-bold text-white">
            {limit ? `${meetingsThisMonth} / ${limit}` : "Unlimited"}
          </span>
        </div>
        {limit ? (
          <>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
            </div>
            <Link
              href="/settings/billing"
              className="block rounded-[9px] bg-teal py-2 text-center text-[12.5px] font-bold text-white transition hover:bg-teal-600"
            >
              Upgrade plan
            </Link>
          </>
        ) : (
          <p className="text-[12px] text-white/50">Meetings this month: {meetingsThisMonth}</p>
        )}
      </div>
    </aside>
  );
}
