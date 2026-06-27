import Link from "next/link";
import { SignUp, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { clerkAppearance } from "@/lib/clerkAppearance";
import { buttonVariants } from "@/components/ui/button";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      {hasClerk ? (
        <>
          <ClerkLoading>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-teal-600" /> Loading secure sign-up…
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <div className="flex flex-col items-center gap-4 w-full">
              <SignUp appearance={clerkAppearance} forceRedirectUrl="/dashboard" signInUrl="/sign-in" />
              <p className="text-[11px] text-center text-muted-foreground max-w-[340px] leading-normal px-2">
                By signing up, you agree to our{" "}
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
            Add your Clerk keys to <code className="font-mono">.env</code> to enable sign-up. You can
            still explore the product in development.
          </p>
          <Link href="/dashboard" className={buttonVariants({ variant: "accent" })}>
            Try the dashboard flow
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
