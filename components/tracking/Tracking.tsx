"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageview, trackOncePerSession } from "@/lib/tracking";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function loadMetaPixel(id: string) {
  const w = window as any;
  if (w.fbq) return;
  const fbq: any = (...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  w.fbq = fbq;
  w._fbq = fbq;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  w.fbq("init", id);
}

function loadPostHog(key: string, host: string) {
  const w = window as any;
  if (w.posthog) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = host + "/static/array.js";
  s.onload = () => {
    w.posthog?.init?.(key, { api_host: host, capture_pageview: false });
  };
  document.head.appendChild(s);
}

/** Pageviews + funnel conversions on route changes. Needs Suspense (useSearchParams). */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackPageview();
    // New signups land on /dashboard?welcome=1 (set by the sign-up redirect).
    if (pathname === "/dashboard" && searchParams.get("welcome") === "1") {
      trackOncePerSession("signup", "CompleteRegistration");
    }
    // Stripe subscription checkout returns to /settings/billing?status=success.
    if (pathname === "/settings/billing" && searchParams.get("status") === "success") {
      trackOncePerSession("subscribe", "Subscribe");
    }
    // $9 chat-message pack purchase returns to /chat?pack=success.
    if (pathname === "/chat" && searchParams.get("pack") === "success") {
      trackOncePerSession("pack", "Purchase");
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Marketing analytics bootstrap. Dormant until NEXT_PUBLIC_META_PIXEL_ID and/or
 * NEXT_PUBLIC_POSTHOG_KEY are set — renders nothing and loads no scripts without them.
 */
export function Tracking() {
  useEffect(() => {
    if (PIXEL_ID) loadMetaPixel(PIXEL_ID);
    if (POSTHOG_KEY) loadPostHog(POSTHOG_KEY, POSTHOG_HOST);
  }, []);

  if (!PIXEL_ID && !POSTHOG_KEY) return null;
  return (
    <Suspense fallback={null}>
      <PageviewTracker />
    </Suspense>
  );
}
