"use client";

import { Suspense, lazy } from "react";

// react-spline's default export is the client <Spline> component; lazy-load so
// the ~heavy Spline runtime is code-split out of the initial bundle.
const Spline = lazy(() => import("@splinetool/react-spline"));

const NEXBOT_SCENE = "https://prod.spline.design/4M2H4rdrILka9bMO/scene.splinecode";

/**
 * NEXBOT robot hero (temporary). Published from the CC0 Spline community scene
 * into the CLARIX workspace with the NEXBOT wordmark hidden and a transparent
 * background, so it drops in behind the site's own CLARIX letters. The robot's
 * head follows the cursor (behavior baked into the Spline scene).
 */
export function SplineHero({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Suspense fallback={null}>
        <Spline scene={NEXBOT_SCENE} style={{ width: "100%", height: "100%" }} />
      </Suspense>
    </div>
  );
}
