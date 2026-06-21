import Link from "next/link";
import { format } from "date-fns";
import { Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <Link href={`/meetings/${meeting.id}`}>
      <Card className="p-4 transition-colors hover:border-teal/60">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-medium">{meeting.title}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MeetingTypeBadge typeId={meeting.meetingType} />
              <StatusBadge status={meeting.status} />
            </div>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {format(new Date(meeting.createdAt), "MMM d")}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="size-3" />{formatDuration(meeting.duration)}</span>
          <span className="flex items-center gap-1"><Users className="size-3" />{meeting.speakerCount ?? "—"} speakers</span>
        </div>
      </Card>
    </Link>
  );
}
