import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid size-7 place-items-center rounded-md bg-navy text-teal font-bold">C</span>
      <span className="text-lg">
        CLAR<span className="text-teal">IX</span>
      </span>
    </Link>
  );
}
