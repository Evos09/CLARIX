import { TopNav } from "@/components/layout/TopNav";
import { PageHeader, Accent } from "@/components/layout/PageHeader";
import { ActionItemsClient } from "@/components/dashboard/ActionItemsClient";

export const metadata = { title: "Action Items" };

export default function ActionItemsPage() {
  return (
    <>
      <TopNav title="Action Items" />
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <PageHeader
          eyebrow="Action Items"
          title={<>Every commitment, <Accent>tracked</Accent>.</>}
          description="Everything CLARIX extracted across your meetings, in one queue — assign owners, set due dates, check things off."
        />
        <ActionItemsClient />
      </main>
    </>
  );
}
