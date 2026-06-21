import { TopNav } from "@/components/layout/TopNav";
import { NewMeetingClient } from "@/components/meetings/NewMeetingClient";

export const metadata = { title: "New Meeting" };

export default function NewMeetingPage() {
  return (
    <>
      <TopNav title="New Meeting" />
      <main className="flex-1 p-4 md:p-6">
        <NewMeetingClient />
      </main>
    </>
  );
}
