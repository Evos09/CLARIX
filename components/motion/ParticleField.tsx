"use client";

import { useEffect, useRef } from "react";

/**
 * 3D particle torus rendered on a 2D canvas (no WebGL deps).
 * Slowly rotates and parallaxes toward the cursor; brand-violet points with
 * depth-based size/alpha. Static single frame under prefers-reduced-motion.
 */
export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let w = 0;
    let h = 0;

    const N = 520;
    const pts: { a: number; b: number; drift: number }[] = [];
    for (let i = 0; i < N; i++) {
      pts.push({
        a: Math.random() * Math.PI * 2,
        b: Math.random() * Math.PI * 2,
        drift: 0.0002 + Math.random() * 0.0005,
      });
    }
    const mouse = { x: 0, y: 0 };

    function resize() {
      if (!canvas || !ctx) return;
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function onMouse(e: MouseEvent) {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    }
    window.addEventListener("mousemove", onMouse, { passive: true });

    let t = 0;
    function frame() {
      if (!ctx) return;
      t += 0.0035;
      ctx.clearRect(0, 0, w, h);

      const R = Math.min(w, h) * 0.3;
      const r2 = R * 0.44;
      const rotY = t + mouse.x * 0.7;
      const rotX = 0.55 + mouse.y * 0.45;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      for (const p of pts) {
        p.a += p.drift;
        const ring = R + r2 * Math.cos(p.b);
        const x = ring * Math.cos(p.a);
        const y = r2 * Math.sin(p.b);
        const z = ring * Math.sin(p.a);

        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const persp = 700 / (700 + z2);
        const sx = w / 2 + x1 * persp;
        const sy = h / 2 + y1 * persp;
        const depth = (z2 + R + r2) / (2 * (R + r2)); // 0 near .. 1 far
        const alpha = 0.12 + (1 - depth) * 0.5;
        const size = (1 - depth) * 2.1 + 0.4;

        ctx.beginPath();
        ctx.fillStyle = `rgba(109,40,217,${alpha.toFixed(3)})`;
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
