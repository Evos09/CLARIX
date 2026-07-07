import { TopNav } from "@/components/layout/TopNav";
import { PageHeader, Accent } from "@/components/layout/PageHeader";
import { AnalyticsOverviewClient } from "@/components/analytics/AnalyticsOverviewClient";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <>
      <TopNav title="Analytics" />
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <PageHeader
          eyebrow="Analytics"
          title={<>Your team, <Accent>understood</Accent>.</>}
          description="Rollup diagnostics and behavioral trends across your team's conversations."
        />
        <AnalyticsOverviewClient />
      </main>
    </>
  );
}
