"use client";

import { useEffect } from "react";

/** Loads the marketing site's vanilla JS (sticky nav, reveals, FAQ, tabs, orbs)
 *  after the injected markup is in the DOM. Re-runs per page mount. */
export function SiteScript() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "/site/scripts/main.js";
    s.async = false;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, []);
  return null;
}
