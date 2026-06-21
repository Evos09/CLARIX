"use client";

import { UserButton } from "@clerk/nextjs";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function UserMenu() {
  if (!hasClerk) {
    return (
      <div className="grid size-8 place-items-center rounded-full bg-navy text-xs font-semibold text-teal">
        ME
      </div>
    );
  }
  return <UserButton />;
}
