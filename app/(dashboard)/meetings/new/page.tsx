import { TopNav } from "@/components/layout/TopNav";
import { PageHeader, Accent } from "@/components/layout/PageHeader";
import { NewMeetingWithBot } from "@/components/meetings/NewMeetingWithBot";

export const metadata = { title: "New Meeting" };

export default function NewMeetingPage() {
  return (
    <>
      <TopNav title="New Meeting" showNewMeeting={false} />
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <PageHeader
          eyebrow="New Meeting"
          title={<>Capture your next <Accent>conversation</Accent>.</>}
          description="Upload a file, record in your browser, or send the CLARIX notetaker to a live call."
        />
        <NewMeetingWithBot />
      </main>
    </>
  );
}
