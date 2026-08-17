import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { corsPreflight, applyCors } from "@/lib/cors";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/meetings(.*)",
  "/settings(.*)",
  "/team(.*)",
  "/chat(.*)",
  "/analytics(.*)",
  "/action-items(.*)",
  "/audio(.*)",
  "/series(.*)",
]);

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Cross-origin clients (Chrome extension, Tauri desktop) call the JSON API with
// a Bearer token. Clerk already authenticates that token on /api
// (the matcher below covers it); here we only add the CORS layer those clients
// need. Same-origin web requests are unaffected (CORS headers are inert there).
const isApi = (req: NextRequest) => req.nextUrl.pathname.startsWith("/api");

export default hasClerk
  ? clerkMiddleware(async (auth, req) => {
      if (isApi(req) && req.method === "OPTIONS") return corsPreflight(req);

      const { userId } = await auth();
      if (userId && req.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      if (isProtectedRoute(req)) await auth.protect();

      if (isApi(req)) return applyCors(NextResponse.next(), req);
    })
  : function proxy(req: NextRequest) {
      if (isApi(req)) {
        if (req.method === "OPTIONS") return corsPreflight(req);
        return applyCors(NextResponse.next(), req);
      }
      return NextResponse.next();
    };

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
