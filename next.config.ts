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
};

export default nextConfig;
