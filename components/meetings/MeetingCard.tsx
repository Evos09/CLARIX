import Link from "next/link";
import { format } from "date-fns";
import { Clock, Users } from "lucide-react";
import { MeetingTypeBadge } from "./MeetingTypeBadge";
import { StatusBadge } from "./StatusBadge";
import { formatDuration } from "@/lib/utils";

export interface MeetingListItem {
  id: string;
  title: string;
  meetingType: string;
  status: string;
  duration: number | null;
  speakerCount: number | null;
  createdAt: string | Date;
}

export function MeetingCard({ meeting }: { meeting: MeetingListItem }) {
  return (
    <Link href={`/meetings/${meeting.id}`} className="group block">
      <div className="rounded-xl border border-border bg-card p-4 transition-all group-hover:border-foreground/15 group-hover:shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-[14px] font-semibold leading-snug text-foreground group-hover:text-accent transition-colors">
            {meeting.title}
          </h3>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {format(new Date(meeting.createdAt), "MMM d")}
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <MeetingTypeBadge typeId={meeting.meetingType} />
          <StatusBadge status={meeting.status} />
        </div>
        <div className="mt-3 flex items-center gap-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="size-3" />{formatDuration(meeting.duration)}</span>
          <span className="flex items-center gap-1.5"><Users className="size-3" />{meeting.speakerCount ?? "—"} speakers</span>
        </div>
      </div>
    </Link>
  );
}
