import Link from "next/link";
import { SignUp, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { buttonVariants } from "@/components/ui/button";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      {hasClerk ? (
        <>
          <ClerkLoading>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-teal-600" /> Loading secure sign-up…
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <SignUp />
          </ClerkLoaded>
        </>
      ) : (
        <div className="max-w-md space-y-4 text-center">
          <Logo />
          <h1 className="text-xl font-semibold">Authentication not configured</h1>
          <p className="text-sm text-muted-foreground">
            Add your Clerk keys to <code className="font-mono">.env</code> to enable sign-up. You can
            still explore the product in development.
          </p>
          <Link href="/onboarding" className={buttonVariants({ variant: "accent" })}>
            Try the onboarding flow
          </Link>
        </div>
      )}
    </div>
  );
}
