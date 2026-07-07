import { TopNav } from "@/components/layout/TopNav";
import { PageHeader, Accent } from "@/components/layout/PageHeader";
import { AudioLibraryClient } from "@/components/audio/AudioLibraryClient";

export const metadata = { title: "Audio Library" };
export const dynamic = "force-dynamic";

export default function AudioPage() {
  return (
    <>
      <TopNav title="Audio Library" />
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <PageHeader
          eyebrow="Audio Library"
          title={<>Every recording, <Accent>kept</Accent>.</>}
          description="Search, replay, and reprocess the audio behind every meeting in your workspace."
        />
        <AudioLibraryClient />
      </main>
    </>
  );
}
