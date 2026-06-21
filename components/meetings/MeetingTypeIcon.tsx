import { icons, type LucideProps } from "lucide-react";

export function MeetingTypeIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = icons[name as keyof typeof icons] ?? icons.MessageSquare;
  return <Icon {...props} />;
}
