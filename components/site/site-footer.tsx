"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerLinks: Record<string, { name: string; href: string }[]> = {
  Product: [
    { name: "Features", href: "/features" },
    { name: "Meeting Types", href: "/meeting-types" },
    { name: "Pricing", href: "/pricing" },
    { name: "Integrations", href: "/integrations" },
  ],
  Company: [
    { name: "Contact", href: "/contact" },
  ],
  Legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Security", href: "/security" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="relative border-t border-foreground/10 overflow-hidden">
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 lg:gap-8">
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
                <span className="grid place-items-center w-7 h-7 rounded-md bg-accent text-accent-foreground font-display text-lg leading-none">
                  C
                </span>
                <span className="text-2xl font-display">CLARIX</span>
              </Link>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                The AI meeting assistant that turns every conversation into structured action — automatically.
              </p>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                      >
                        {link.name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="py-8 border-t border-foreground/10 space-y-3">
          <p className="text-sm text-muted-foreground">© 2026 CLARIX. All rights reserved.</p>
          <p className="text-xs leading-relaxed text-muted-foreground/70">
            All product names, logos, and brands shown are property of their respective owners and
            are used for identification purposes only. Use of these names, logos, and brands does
            not imply endorsement or affiliation.
          </p>
        </div>
      </div>
    </footer>
  );
}
