import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md space-y-4 text-center">
        <Logo />
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-sm text-muted-foreground">We couldn&apos;t find that page.</p>
        <Link href="/" className={cn(buttonVariants({ variant: "accent" }))}>Back home</Link>
      </div>
    </div>
  );
}
