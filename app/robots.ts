import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    // "/demo/" (with the trailing slash) blocks the interactive per-visitor
    // demo meetings at /demo/[id] — those hold audio a stranger uploaded and
    // must never be indexed — while leaving the static /demo page crawlable.
    // "/share/" is the same problem: real meetings behind a share token.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/meetings", "/settings", "/team", "/api", "/demo/", "/share/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
