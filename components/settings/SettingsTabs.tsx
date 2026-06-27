"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building, CreditCard, Users } from "lucide-react";

export function SettingsTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/settings", label: "Workspace", icon: Building },
    { href: "/settings/billing", label: "Billing", icon: CreditCard },
    { href: "/settings/team", label: "Team", icon: Users },
  ];

  return (
    <div className="border-b border-border bg-card px-4 md:px-6 shrink-0">
      <div className="flex gap-6">
        {tabs.map((tab) => {
          // Match "/settings" exactly, or subpaths like "/settings/billing"
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 border-b-2 py-4 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border-teal text-teal-600 font-semibold"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
