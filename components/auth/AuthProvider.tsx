import { ClerkProvider } from "@clerk/nextjs";

/**
 * Wraps the app in ClerkProvider only when Clerk is configured.
 * Without keys, the app still renders (auth-gated pages fall back gracefully),
 * which lets CLARIX run on Anthropic + Supabase alone during development.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }
  return <ClerkProvider>{children}</ClerkProvider>;
}
