"use client";

import { useEffect } from "react";

/** Re-implements the Claude Design support behaviors for the imported landing markup. */
export function LandingScript() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // hover styles (style-hover attribute)
    document.querySelectorAll<HTMLElement>("[style-hover]").forEach((el) => {
      const hover = el.getAttribute("style-hover") ?? "";
      const orig = el.style.cssText;
      const enter = () => { el.style.cssText = orig + ";" + hover; };
      const leave = () => { el.style.cssText = orig; };
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      cleanups.push(() => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); });
    });

    // reveal on scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { (e.target as HTMLElement).classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    // animated counters
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        cio.unobserve(el);
        const target = parseFloat(el.getAttribute("data-count") ?? "0");
        const suffix = el.getAttribute("data-suffix") ?? "";
        const compact = el.getAttribute("data-format") === "compact";
        const fmt = (n: number) => {
          if (compact) {
            if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
            if (n >= 1e3) return Math.round(n / 1e3) + "K";
          }
          return Math.round(n).toString();
        };
        const dur = 1400;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          el.textContent = fmt(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

    // scroll progress + sticky header
    const progress = document.querySelector<HTMLElement>("[data-progress]");
    const sticky = document.querySelector<HTMLElement>("[data-sticky]");
    const onScroll = () => {
      const h = document.documentElement;
      if (progress) {
        const max = h.scrollHeight - h.clientHeight;
        progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
      }
      if (sticky) {
        const on = h.scrollTop > 24;
        sticky.style.background = on ? "rgba(10,22,40,.85)" : "rgba(10,22,40,0)";
        sticky.style.backdropFilter = on ? "blur(12px)" : "blur(0px)";
        sticky.style.setProperty("-webkit-backdrop-filter", on ? "blur(12px)" : "blur(0px)");
        sticky.style.boxShadow = on ? "0 8px 30px rgba(0,0,0,.25)" : "none";
        sticky.style.padding = on ? "10px 40px" : "14px 40px";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // hero cursor glow
    const glow = document.querySelector<HTMLElement>("[data-cursor-glow]");
    const hero = glow?.closest("section") ?? null;
    if (glow && hero) {
      const onMove = (ev: Event) => {
        const m = ev as MouseEvent;
        const r = (hero as HTMLElement).getBoundingClientRect();
        glow.style.transform = "translate(" + (m.clientX - r.left - 170) + "px," + (m.clientY - r.top - 170) + "px)";
        glow.style.opacity = "1";
      };
      const onLeave = () => { glow.style.opacity = "0"; };
      hero.addEventListener("mousemove", onMove);
      hero.addEventListener("mouseleave", onLeave);
      cleanups.push(() => { hero.removeEventListener("mousemove", onMove); hero.removeEventListener("mouseleave", onLeave); });
    }

    return () => { cleanups.forEach((c) => c()); io.disconnect(); cio.disconnect(); };
  }, []);

  return null;
}
