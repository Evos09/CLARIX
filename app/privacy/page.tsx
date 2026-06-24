import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CLARIX collects, uses, and protects your data.",
};

export default function Page() {
  return <SiteShell html={HTML} />;
}
