"use client";

import React from "react";

interface CommandConsoleProps {
  activeZone: number;
}

export default function CommandConsole({ activeZone }: CommandConsoleProps) {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#fbfbfd] flex items-center justify-center pointer-events-none z-0">
      
      {/* Ambient micro-grid background (Light Theme) */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(124,79,232,0.06),transparent)" />
      </div>

      {/* Tilted 3D HUD Canvas spanning huge viewport area */}
      <div 
        className="spline-container w-[1380px] h-[850px] relative transition-transform duration-500 ease-out-expo flex items-center justify-center"
        style={{
          transform: "perspective(1500px) rotateX(12deg) rotateY(-4deg) rotateZ(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        
        {/* ================= BACKGROUND CENTRAL BLUEPRINT CORE ================= */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none opacity-30">
          <svg className="w-[780px] h-[780px] text-violet-500/10" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer rings & angle ticks */}
            <circle cx="200" cy="200" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
            <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="16 12" className="animate-[spin_40s_linear_infinite]" />
            <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_20s_linear_infinite_reverse]" />
            
            {/* Center core emitter */}
            <circle cx="200" cy="200" r="40" stroke="#7c4fe8" strokeWidth="1.5" className="animate-pulse" />
            <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            <text x="210" y="50" fill="currentColor" className="text-[6px] font-mono tracking-widest font-semibold uppercase">ALIGN_SYS_0</text>
            <text x="210" y="360" fill="currentColor" className="text-[6px] font-mono tracking-widest font-semibold uppercase">ALIGN_SYS_180</text>
          </svg>
        </div>

        {/* ================= HUD CORE PANEL LAYOUT (ABSOLUTE PLACEMENTS) ================= */}

        {/* 1. SENSORY RECEIVER RADAR (Zone 2 - Listening, Top-Left) */}
        <div 
          className="absolute top-[8%] left-[6%] w-[360px] h-[260px] rounded-2xl bg-white/50 border border-violet-100 p-5 flex flex-col justify-between shadow-[0_15px_45px_rgba(124,79,232,0.03)] backdrop-blur-md hover:border-violet-200 transition-all duration-300 group"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[8px] font-mono text-violet-950/50 tracking-wider font-semibold">01 // SENSORY_RECEIVER</span>
            <span className={`text-[8px] font-mono font-semibold px-2 py-0.5 rounded border ${activeZone === 2 ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-violet-50/20 border-violet-100 text-violet-300'}`}>
              {activeZone === 2 ? 'ACTIVE' : 'STBY'}
            </span>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative py-4">
            <svg className="w-[110px] h-[110px] text-violet-500/10" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
              <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="26" fill="none" stroke="#7c4fe8" strokeWidth="1" strokeDasharray="16 12" className={activeZone === 2 ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />
              <circle cx="50" cy="50" r="16" fill="none" stroke="#7c4fe8" strokeWidth="1" strokeDasharray="6 6" className={activeZone === 2 ? "animate-spin" : ""} style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
              <circle cx="50" cy="50" r="6" fill="#fafafd" stroke="#7c4fe8" strokeWidth="2" />
              <circle cx="50" cy="50" r="3.5" fill="#7c4fe8" className={activeZone === 2 ? "animate-pulse" : ""} />
            </svg>
          </div>
          
          <div className="flex justify-between items-center border-t border-violet-100/50 pt-2">
            <span className="text-[7px] font-mono text-violet-950/40">SIG_INTENSITY</span>
            <span className={`text-[8px] font-mono transition-colors font-bold ${activeZone === 2 ? 'text-violet-700' : 'text-violet-300'}`}>94.2 dB</span>
          </div>
        </div>

        {/* 2. MONITOR CRT SCREEN (Zone 5 - Responding, Top-Center) */}
        <div 
          className="absolute top-[8%] left-[37%] w-[360px] h-[260px] rounded-2xl bg-white/50 border border-violet-100 p-5 flex flex-col justify-between shadow-[0_15px_45px_rgba(124,79,232,0.03)] backdrop-blur-md hover:border-violet-200 transition-all duration-300"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[8px] font-mono text-violet-950/50 tracking-wider font-semibold">02 // VOICE_SPECTRUM</span>
            <span className="text-[7px] font-mono text-violet-900/40 font-semibold">CRT_EMU_ON</span>
          </div>
          
          <div className="flex-1 rounded-xl bg-white border border-violet-100/70 relative overflow-hidden flex items-center justify-center my-3 shadow-inner">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#7c4fe808_1px,transparent_1px),linear-gradient(to_bottom,#7c4fe808_1px,transparent_1px)] bg-[size:12px_12px]" />
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 200 100" preserveAspectRatio="none">
              <path 
                d={activeZone === 5 
                  ? "M 0 50 Q 25 15, 50 50 T 100 50 T 150 50 T 200 50" 
                  : "M 0 50 Q 25 45, 50 50 T 100 50 T 150 50 T 200 50"
                }
                fill="none" 
                stroke="#7c4fe8" 
                strokeWidth="2" 
                opacity="0.85"
                className={activeZone === 5 ? "animate-pulse" : ""}
              />
              <path 
                d={activeZone === 5 
                  ? "M 0 50 Q 35 75, 70 50 T 140 50 T 200 50" 
                  : "M 0 50 Q 35 52, 70 50 T 140 50 T 200 50"
                }
                fill="none" 
                stroke="#a78bfa" 
                strokeWidth="1" 
                opacity="0.4"
              />
            </svg>
            <div className="absolute top-2 left-2 text-[7px] font-mono text-violet-900/40 uppercase tracking-widest font-semibold">WAVE_SYS_INIT</div>
            <div className="absolute bottom-2 right-2 text-[7px] font-mono text-violet-900/40">44.1 kHz</div>
          </div>
          
          <div className="flex justify-between items-center border-t border-violet-100/50 pt-2">
            <span className="text-[7px] font-mono text-violet-950/40">DECODER_STATUS</span>
            <span className={`text-[8px] font-mono transition-colors ${activeZone === 5 ? 'text-violet-700 font-bold' : 'text-violet-300'}`}>
              {activeZone === 5 ? 'PROCESSING' : 'IDLE'}
            </span>
          </div>
        </div>

        {/* 3. PROCESS TRIGGERS / KEYPAD (Zone 3 - Deciding, Top-Right) */}
        <div 
          className="absolute top-[8%] right-[6%] w-[360px] h-[260px] rounded-2xl bg-white/50 border border-violet-100 p-5 flex flex-col justify-between shadow-[0_15px_45px_rgba(124,79,232,0.03)] backdrop-blur-md hover:border-violet-200 transition-all duration-300"
          style={{ transform: "translateZ(30px)" }}
        >
          <span className="text-[8px] font-mono text-violet-950/50 tracking-wider block mb-3 font-semibold">03 // DECISION_TRIGGERS</span>
          
          <div className="flex-1 flex flex-col gap-2.5 justify-center">
            <div className={`p-2.5 rounded-lg border text-center transition-all duration-300 ${activeZone === 3 ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(124,79,232,0.3)]' : 'bg-white border-violet-100 text-violet-400'}`}>
              <span className="text-[8px] font-mono block tracking-widest font-semibold">TRIG_RECAP</span>
            </div>
            <div className={`p-2.5 rounded-lg border text-center transition-all duration-300 ${activeZone === 3 ? 'bg-violet-950 text-white shadow-[0_0_12px_rgba(0,0,0,0.15)]' : 'bg-white border-violet-100 text-violet-400'}`}>
              <span className="text-[8px] font-mono block tracking-widest font-semibold">TRIG_ACTION</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-violet-100/30 text-center text-violet-300/60">
              <span className="text-[8px] font-mono block">STBY_BYPASS</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-violet-100/50 pt-2">
            <span className="text-[7px] font-mono text-violet-950/40">STABILIZER_LOCK</span>
            <span className={`w-1.5 h-1.5 rounded-full ${activeZone === 3 ? 'bg-violet-600 shadow-[0_0_6px_rgba(124,79,232,0.4)]' : 'bg-violet-200'}`} />
          </div>
        </div>

        {/* 4. TAPE MEMORY STORAGE (Zone 4 - Remembering, SWAPPED to Bottom-Left) */}
        <div 
          className="absolute bottom-[8%] left-[6%] w-[360px] h-[260px] rounded-2xl bg-white/50 border border-violet-100 p-5 flex flex-col justify-between shadow-[0_15px_45px_rgba(124,79,232,0.03)] backdrop-blur-md hover:border-violet-200 transition-all duration-300"
          style={{ transform: "translateZ(30px)" }}
        >
          <span className="text-[8px] font-mono text-violet-950/50 tracking-wider block mb-3 font-semibold">05 // TAPE_MEMORY_REEL</span>
          
          <div className="flex-1 rounded-xl bg-white border border-violet-100/70 p-3 flex items-center justify-between relative shadow-inner">
            <div className="flex gap-6 w-full justify-center">
              <div className="w-9 h-9 rounded-full border border-dashed border-violet-250 flex items-center justify-center bg-violet-50/50 relative">
                <div className={`w-3.5 h-3.5 rounded-full bg-violet-600/40 ${activeZone === 4 ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              </div>
              <div className="w-9 h-9 rounded-full border border-dashed border-violet-250 flex items-center justify-center bg-violet-50/50 relative">
                <div className={`w-3.5 h-3.5 rounded-full bg-violet-600/40 ${activeZone === 4 ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              </div>
            </div>
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[6px] font-mono text-violet-900/40 uppercase tracking-widest font-semibold">MEM_REEL_T90</div>
          </div>

          <div className="flex justify-between items-center border-t border-violet-100/50 pt-2">
            <span className="text-[7px] font-mono text-violet-950/40">CASSETTE_SECTOR</span>
            <span className={`text-[8px] font-mono transition-colors font-bold ${activeZone === 4 ? 'text-violet-700' : 'text-violet-300'}`}>
              {activeZone === 4 ? 'SECTOR_READ' : 'SYNC_OK'}
            </span>
          </div>
        </div>

        {/* 5. NEURAL LINK PORTS (Zone 6 - Connecting, SWAPPED to Bottom-Center) */}
        <div 
          className="absolute bottom-[8%] left-[37%] w-[360px] h-[260px] rounded-2xl bg-white/50 border border-violet-100 p-5 flex flex-col justify-between shadow-[0_15px_45px_rgba(124,79,232,0.03)] backdrop-blur-md hover:border-violet-200 transition-all duration-300"
          style={{ transform: "translateZ(30px)" }}
        >
          <span className="text-[8px] font-mono text-violet-950/50 tracking-wider block mb-3 font-semibold">04 // NEURAL_LINK_PORTS</span>
          
          <div className="flex-1 flex gap-4 items-center justify-start py-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${activeZone === 6 ? 'bg-violet-600 text-white shadow-[0_0_8px_rgba(124,79,232,0.3)]' : 'bg-white border-violet-100 text-violet-400'}`}>
                <span className="text-[7.5px] font-mono">GML</span>
              </div>
              <span className="text-[7px] font-mono text-violet-950/40">GMAIL</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${activeZone === 6 ? 'bg-violet-600 text-white shadow-[0_0_8px_rgba(124,79,232,0.3)]' : 'bg-white border-violet-100 text-violet-400'}`}>
                <span className="text-[7.5px] font-mono">NOT</span>
              </div>
              <span className="text-[7px] font-mono text-violet-950/40">NOTION</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${activeZone === 6 ? 'bg-violet-600 text-white shadow-[0_0_8px_rgba(124,79,232,0.3)]' : 'bg-white border-violet-100 text-violet-400'}`}>
                <span className="text-[7.5px] font-mono">GCL</span>
              </div>
              <span className="text-[7px] font-mono text-violet-950/40">G_CAL</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${activeZone === 6 ? 'bg-violet-600 text-white shadow-[0_0_8px_rgba(124,79,232,0.3)]' : 'bg-white border-violet-100 text-violet-400'}`}>
                <span className="text-[7.5px] font-mono">ZOM</span>
              </div>
              <span className="text-[7px] font-mono text-violet-950/40">ZOOM</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-violet-100/50 pt-2">
            <span className="text-[7px] font-mono text-violet-950/40">LINK_FLOW_STATE</span>
            <span className={`text-[8px] font-mono transition-colors font-bold ${activeZone === 6 ? 'text-violet-700' : 'text-violet-300'}`}>
              {activeZone === 6 ? 'ESTABLISHED' : 'READY'}
            </span>
          </div>
        </div>

        {/* 6. THERMAL CORE REACTOR (Zone 7 - Pricing, Bottom-Right) */}
        <div 
          className="absolute bottom-[8%] right-[6%] w-[360px] h-[260px] rounded-2xl bg-white/50 border border-violet-100 p-5 flex flex-col justify-between shadow-[0_15px_45px_rgba(124,79,232,0.03)] backdrop-blur-md hover:border-violet-200 transition-all duration-300"
          style={{ transform: "translateZ(30px)" }}
        >
          <span className="text-[8px] font-mono text-violet-950/50 tracking-wider block mb-3 font-semibold">06 // REACTOR_CELL</span>
          
          <div className="flex-1 flex items-center justify-center py-1">
            <div className={`w-12 h-12 rounded-full border transition-all duration-500 flex items-center justify-center ${activeZone === 7 ? 'bg-violet-50 border-violet-400 shadow-[0_0_12px_rgba(124,79,232,0.2)]' : 'bg-white border-violet-100'}`}>
              <div className={`w-6 h-6 rounded-full transition-all duration-500 ${activeZone === 7 ? 'bg-violet-600 animate-pulse shadow-[0_0_8px_rgba(124,79,232,0.4)]' : 'bg-violet-200'}`} />
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-violet-100/50 pt-2">
            <span className="text-[7px] font-mono text-violet-950/40">REACTOR_CAPACITY</span>
            <span className={`text-[8px] font-mono transition-colors font-bold ${activeZone === 7 ? 'text-violet-700' : 'text-violet-300'}`}>
              {activeZone === 7 ? '100%_STABLE' : 'STANDBY'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
