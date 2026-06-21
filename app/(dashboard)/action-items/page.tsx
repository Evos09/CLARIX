import { TopNav } from "@/components/layout/TopNav";
import { ActionItemsClient } from "@/components/dashboard/ActionItemsClient";

export const metadata = { title: "Action Items" };

export default function ActionItemsPage() {
  return (
    <>
      <TopNav title="Action Items" />
      <main className="flex-1 p-4 md:p-6">
        <ActionItemsClient />
      </main>
    </>
  );
}
