import Link from "next/link";
import { SignIn, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { buttonVariants } from "@/components/ui/button";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      {hasClerk ? (
        <>
          <ClerkLoading>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-teal-600" /> Loading secure sign-in…
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <SignIn forceRedirectUrl="/onboarding" />
          </ClerkLoaded>
        </>
      ) : (
        <div className="max-w-md space-y-4 text-center">
          <Logo />
          <h1 className="text-xl font-semibold">Authentication not configured</h1>
          <p className="text-sm text-muted-foreground">
            Add your Clerk keys to <code className="font-mono">.env</code> to enable sign-in. You can
            still explore the dashboard in development.
          </p>
          <Link href="/dashboard" className={buttonVariants({ variant: "accent" })}>
            Continue to dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
