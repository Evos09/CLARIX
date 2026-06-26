import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/hipaa";

export const metadata: Metadata = {
  title: "HIPAA Compliance",
  description: "How CLARIX supports HIPAA compliance for healthcare providers.",
};

export default function Page() {
  return <SiteShell html={HTML} />;
}
