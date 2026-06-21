import { Badge } from "@/components/ui/badge";
import { BADGE_CLASSES, getMeetingType } from "@/lib/meetingTypes";
import { MeetingTypeIcon } from "./MeetingTypeIcon";
import { cn } from "@/lib/utils";

export function MeetingTypeBadge({ typeId, className }: { typeId: string; className?: string }) {
  const t = getMeetingType(typeId);
  return (
    <Badge className={cn(BADGE_CLASSES[t.color], className)}>
      <MeetingTypeIcon name={t.icon} className="size-3" />
      {t.label}
    </Badge>
  );
}
