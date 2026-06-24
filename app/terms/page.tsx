import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/terms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of CLARIX.",
};

export default function Page() {
  return <SiteShell html={HTML} />;
}
