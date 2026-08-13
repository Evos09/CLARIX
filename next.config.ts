import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Next infers the workspace root by looking for a lockfile, walking up past
    // this project. A stray package-lock.json in a parent directory (e.g.
    // C:\Users\<you>) wins, and module resolution then starts from the wrong
    // place — which is what made `next dev` fail to resolve @clerk/nextjs here.
    // Pin it so dev and build behave the same on every machine.
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        // The desktop app is a WebView2 shell pointed at these live URLs, so a
        // web deploy is how it receives new code — there is no bundled frontend
        // to update. But /overlay prerendered statically and went out with
        // `s-maxage=31536000`, and WebView2 held onto that copy: fixes shipped,
        // production served them, and the app kept running last week's HTML —
        // and therefore last week's JS chunks — with no way out short of
        // clearing the cache by hand.
        //
        // The HTML entry document must always be revalidated. Hashed assets
        // under /_next/static are content-addressed and immutable, so they stay
        // cached as normal; this costs one small request each time it opens.
        source: "/overlay",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
