import { TopNav } from "@/components/layout/TopNav";
import { AnalyticsOverviewClient } from "@/components/analytics/AnalyticsOverviewClient";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <>
      <TopNav title="Analytics" />
      <main className="flex-1 p-4 md:p-6">
        <AnalyticsOverviewClient />
      </main>
    </>
  );
}
