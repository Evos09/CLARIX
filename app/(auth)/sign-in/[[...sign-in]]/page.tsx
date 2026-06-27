import Link from "next/link";
import { SignIn, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerkAppearance";
import { buttonVariants } from "@/components/ui/button";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      {hasClerk ? (
        <>
          <ClerkLoading>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-teal-600" /> Loading secure sign-in…
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <div className="flex flex-col items-center gap-4 w-full">
              <SignIn appearance={clerkAppearance} forceRedirectUrl="/dashboard" signUpUrl="/sign-up" />
              <p className="text-[11px] text-center text-muted-foreground max-w-[340px] leading-normal px-2">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{" "}
                and acknowledge our{" "}
                <Link href="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link> (including binding arbitration and class action waiver).
              </p>
            </div>
          </ClerkLoaded>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add your Clerk keys to <code className="font-mono">.env</code> to enable sign-in. You can
            still explore the dashboard in development.
          </p>
          <Link href="/dashboard" className={buttonVariants({ variant: "accent" })}>
            Continue to dashboard
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
