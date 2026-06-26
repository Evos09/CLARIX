"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

export function ClaimButton({ meetingId, isLoggedIn }: { meetingId: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    if (!isLoggedIn) {
      // User is not signed in; redirect to sign-up.
      // The cookie 'clarix_demo_meeting_id' was already set by the upload JS.
      router.push(`/sign-up?demoMeetingId=${meetingId}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meetings/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to claim meeting");
      }
      // Redirect to the actual dashboard meeting detail view
      router.push(`/meetings/${meetingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="accent"
        size="lg"
        className="font-medium shadow-lg"
        disabled={loading}
        onClick={handleClaim}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            Save to my Library <ArrowRight className="ml-2 size-4" />
          </>
        )}
      </Button>
      {error && <span className="text-xs text-destructive text-center">{error}</span>}
    </div>
  );
}
