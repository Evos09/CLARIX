"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CommandConsole from "./CommandConsole";

import HeroZone from "./zones/HeroZone";
import AuditoryCortex from "./zones/AuditoryCortex";
import ReasoningCenter from "./zones/ReasoningCenter";
import MemoryArchive from "./zones/MemoryArchive";
import LanguageCenter from "./zones/LanguageCenter";
import SensoryPorts from "./zones/SensoryPorts";
import PricingCore from "./zones/PricingCore";
import HowItWorksZone from "./zones/HowItWorksZone";
import FinalCta from "./zones/FinalCta";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Console-panel id shown for each sixth of the pinned scroll, in visit order:
// Audio, Monitor CRT, Decision Keys, Ports, Tape Reels, Pricing.
const ZONE_ORDER = [2, 5, 3, 6, 4, 7];

export default function TransitionContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set initial transform origin, scale, translation, and opacity (starts hidden in Hero)
    gsap.set(".spline-container", { transformOrigin: "50% 50%", scale: 1.0, x: 0, opacity: 0 });

    // --- 1. PORTAL ENTRY TIMELINE (Zone 0 -> Zone 2) ---
    // Snappy entry over a ultra-short 30vh scroll spacer
    const entryTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".eye-transition-trigger",
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      },
    });

    entryTl.to(".hero-overlay-text", {
      opacity: 0,
      y: -10,
      duration: 0.3,
    }, 0)
    .fromTo(".spline-container", {
      opacity: 0,
      scale: 1.2,
      x: 0,
    }, {
      opacity: 1, // Fade in console background as you scroll down
      scale: 2.4,
      x: 180, // Slide console right to leave left half clear for copy sidebars
      transformOrigin: "19% 23%", // Center on Sensory Receiver
      duration: 1.0,
      ease: "power2.inOut",
    }, 0)
    .fromTo(".entering-clarix-label", {
      opacity: 0,
      y: 5,
    }, {
      opacity: 0.6,
      y: 0,
      duration: 0.3,
    }, 0.2)
    .to(".entering-clarix-label", {
      opacity: 0,
      y: -5,
      duration: 0.3,
    }, 0.7);


    // --- 2. MASTER BRAIN ZONES INSPECTION TIMELINE (Zones 2 -> 7) ---
    const brainTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".brain-section-trigger",
        start: "top top",
        end: "+=360%",
        pin: ".brain-section-trigger",
        pinSpacing: true,
        scrub: 0.8,
        // Derive the active zone from pin progress so it stays in sync with
        // the pinned section at any viewport height (no hardcoded pixels).
        onUpdate(self) {
          const idx = Math.min(ZONE_ORDER.length - 1, Math.floor(self.progress * ZONE_ORDER.length));
          setActiveZone(ZONE_ORDER[idx]);
        },
        onLeave() { setActiveZone(9); },
        onEnterBack(self) {
          const idx = Math.min(ZONE_ORDER.length - 1, Math.floor(self.progress * ZONE_ORDER.length));
          setActiveZone(ZONE_ORDER[idx]);
        },
        onLeaveBack() { setActiveZone(0); },
      },
    });

    // Ensure console background remains visible and translated during intermediate pans
    brainTl.to(".spline-container", {
      x: 180,
      opacity: 1,
      duration: 0.1,
    }, 0);

    // Zone 2 (Audio, 19% 23%) -> Zone 5 (Monitor CRT, 50% 23%)
    brainTl.to(".spline-container", {
      transformOrigin: "50% 23%",
      scale: 2.4,
      duration: 0.2, // Snappy transition
      ease: "power2.inOut",
    }, 0.8);

    // Zone 5 (Monitor CRT, 50% 23%) -> Zone 3 (Decision Keys, 81% 23%)
    brainTl.to(".spline-container", {
      transformOrigin: "81% 23%",
      scale: 2.4,
      duration: 0.2, // Snappy transition
      ease: "power2.inOut",
    }, 1.8);

    // Zone 3 (Decision Keys, 81% 23%) -> Zone 6 (Ports, 50% 77% - Bottom-Center)
    brainTl.to(".spline-container", {
      transformOrigin: "50% 77%",
      scale: 2.4,
      duration: 0.2, // Snappy transition
      ease: "power2.inOut",
    }, 2.8);

    // Zone 6 (Ports, 50% 77%) -> Zone 4 (Tape Reels, 19% 77% - Bottom-Left)
    brainTl.to(".spline-container", {
      transformOrigin: "19% 77%",
      scale: 2.4,
      duration: 0.2, // Snappy transition
      ease: "power2.inOut",
    }, 3.8);

    // Zone 4 (Tape Reels, 19% 77%) -> Zone 7 (Pricing Core, 81% 77% - Bottom-Right)
    brainTl.to(".spline-container", {
      transformOrigin: "81% 77%",
      scale: 2.4,
      duration: 0.2, // Snappy transition
      ease: "power2.inOut",
    }, 4.8);


    // --- 3. PORTAL EXIT TIMELINE ---
    // Snappy exit triggered when the exit spacer enters the bottom of the viewport
    const exitTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".eye-transition-trigger-exit",
        start: "top bottom", // Triggers when the top of exit spacer enters the viewport bottom
        end: "top center", // Completes when it reaches the center of the viewport
        scrub: 0.5,
      },
    });

    exitTl.to(".spline-container", {
      scale: 1.0,
      x: 0,
      opacity: 0.2, // Softly visible (20%) instead of completely gone to avoid empty white screen
      transformOrigin: "50% 50%",
      duration: 0.5,
      ease: "power2.inOut",
    }, 0)
    .fromTo(".final-cta-overlay", {
      opacity: 0,
      y: 20,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.4,
    }, 0.2);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1200);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative min-h-screen">
      {/* Light glassmorphic HUD engine chassis remains fixed in the background */}
      <CommandConsole activeZone={activeZone} />

      {/* Depth-of-Field Blur Overlay to dull background details for active zones and final CTA */}
      <div 
        className={`fixed inset-0 transition-all duration-1000 ease-in-out pointer-events-none z-[5] ${
          activeZone > 0 ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-[#fbfbfd]/75 backdrop-blur-[8px]" />
      </div>

      {/* --- SCROLLING PAGE CONTENTS --- */}
      
      {/* Zone 0: Baseline Hero */}
      <div className="relative z-10 w-full">
        <HeroZone />
      </div>

      {/* Zone 1: Entry Transition Spacer (30vh) */}
      <div className="eye-transition-trigger relative w-full h-[30vh] bg-transparent pointer-events-none z-10 flex items-center justify-center">
        <div className="entering-clarix-label fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-mono text-violet-900/60 uppercase tracking-[0.25em] pointer-events-none opacity-0 select-none z-30 font-semibold">
          Entering CLARIX mainframe
        </div>
      </div>

      {/* Pinned Brain Interior Wrapper (Zones 2 to 7) */}
      <div className="brain-section-trigger relative w-full h-screen bg-transparent z-10">
        <div className="brain-content-wrapper absolute inset-0 w-full h-full overflow-hidden">
          
          {/* Zone 2: Auditory Cortex (Listening - Top Left) */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-750 ease-in-out z-20 ${
              activeZone === 2 ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
            }`}
          >
            <AuditoryCortex />
          </div>

          {/* Zone 5: Language Center (Responding - Top Center) */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-750 ease-in-out z-20 ${
              activeZone === 5 ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
            }`}
          >
            <LanguageCenter />
          </div>

          {/* Zone 3: Reasoning Center (Deciding - Top Right) */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-750 ease-in-out z-20 ${
              activeZone === 3 ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
            }`}
          >
            <ReasoningCenter />
          </div>

          {/* Zone 6: Sensory Input Ports (Connecting - Bottom Center) */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-750 ease-in-out z-20 ${
              activeZone === 6 ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
            }`}
          >
            <SensoryPorts />
          </div>

          {/* Zone 4: Memory Archive (Remembering - Bottom Left) */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-750 ease-in-out z-20 ${
              activeZone === 4 ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
            }`}
          >
            <MemoryArchive />
          </div>

          {/* Zone 7: Core Pricing (Pricing - Bottom Right) */}
          <div
            className={`absolute inset-0 w-full h-full transition-all duration-750 ease-in-out z-20 ${
              activeZone === 7 ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
            }`}
          >
            <PricingCore />
          </div>

        </div>
      </div>

      {/* Zone 8: Exit Transition Spacer (15vh) */}
      <div className="eye-transition-trigger-exit relative w-full h-[15vh] bg-transparent pointer-events-none z-10" />

      {/* How it works — carried over from the previous homepage */}
      <div className="relative z-10 w-full">
        <HowItWorksZone />
      </div>

      {/* Zone 9: Final CTA overlay & return landing */}
      <div className="relative z-10 w-full">
        <FinalCta />
      </div>
    </div>
  );
}
