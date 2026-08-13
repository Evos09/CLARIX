import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return [
    { url: base, lastModified: new Date(), priority: 1 },
    // The no-signup demo is the highest-intent public page we have after the
    // homepage — someone searching for a meeting recorder can evaluate the
    // actual output straight from search results, without an account.
    { url: `${base}/demo`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/features`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/pricing`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/meeting-types`, lastModified: new Date(), priority: 0.7 },
    { url: `${base}/integrations`, lastModified: new Date(), priority: 0.7 },
    { url: `${base}/download`, lastModified: new Date(), priority: 0.7 },
    { url: `${base}/about`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/security`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/sign-in`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/sign-up`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(), priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), priority: 0.3 },
  ];
}
