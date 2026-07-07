"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { NewMeetingClient } from "@/components/meetings/NewMeetingClient";
import { JoinWithBotTab } from "@/components/meetings/bot/JoinWithBotTab";
import { LiveAssistPanel } from "@/components/meetings/new/LiveAssistPanel";

export function NewMeetingWithBot() {
  const [tab, setTab] = useState<"local" | "bot">("local");
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("local")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "local" ? "bg-accent text-white" : "border border-border hover:bg-muted",
          )}
        >
          Upload or Record
        </button>
        <button
          onClick={() => setTab("bot")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            tab === "bot" ? "bg-accent text-white" : "border border-border hover:bg-muted",
          )}
        >
          Join Live Meeting
        </button>
      </div>
      {tab === "local" ? (<><NewMeetingClient /><div className="mt-4"><LiveAssistPanel /></div></>) : <JoinWithBotTab />}
    </div>
  );
}
