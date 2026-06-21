import { TopNav } from "@/components/layout/TopNav";
import { AudioLibraryClient } from "@/components/audio/AudioLibraryClient";

export const metadata = { title: "Audio Library" };
export const dynamic = "force-dynamic";

export default function AudioPage() {
  return (
    <>
      <TopNav title="Audio Library" />
      <main className="flex-1 p-4 md:p-6">
        <AudioLibraryClient />
      </main>
    </>
  );
}
