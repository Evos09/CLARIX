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
  type LucideIcon,
} from "lucide-react";
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
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/team", label: "Team", icon: Users },
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

  const limit = PLANS[plan].meetingsPerMonth; // null = unlimited
  const pct = limit ? Math.min(100, Math.round((meetingsThisMonth / limit) * 100)) : 0;

  const linkClass = (href: string) =>
    cn(
      "flex items-center justify-between rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
      isActive(href)
        ? "bg-teal/15 text-white"
        : "text-white/60 hover:bg-white/5 hover:text-white",
    );

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-navy px-4 py-5">
      {/* brand */}
      <Link href="/dashboard" className="mb-5 flex items-center gap-2.5 px-2">
        <LogoMark size={30} />
        <span className="text-[18px] font-extrabold tracking-tight text-white">CLARIX</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon, badgeKey }) => (
          <Link key={href} href={href} className={linkClass(href)}>
            <span className="flex items-center gap-3">
              <Icon className="size-4" />
              {label}
            </span>
            {badgeKey === "openActions" && openActions > 0 && (
              <span className="rounded-full bg-teal px-2 py-0.5 text-xs font-semibold text-white">
                {openActions}
              </span>
            )}
          </Link>
        ))}
        <div className="my-3 border-t border-white/10" />
        {FOOTER_NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn(linkClass(href), "justify-start gap-3")}>
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* usage meter / plan card */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
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
