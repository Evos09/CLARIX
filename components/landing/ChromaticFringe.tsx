"use client";

export default function ChromaticFringe() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
      <defs>
        <filter id="chromatic-aberration">
          {/* Shift red channel left by 3px */}
          <feOffset dx="-3" dy="0" in="SourceGraphic" result="red-offset" />
          {/* Shift blue channel right by 3px */}
          <feOffset dx="3" dy="0" in="SourceGraphic" result="blue-offset" />
          
          {/* Isolate red channel */}
          <feColorMatrix
            in="red-offset"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="red"
          />
          {/* Isolate green channel from original graphic */}
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="green"
          />
          {/* Isolate blue channel */}
          <feColorMatrix
            in="blue-offset"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="blue"
          />
          
          {/* Blend red and green */}
          <feBlend mode="screen" in="red" in2="green" result="rg" />
          {/* Blend in blue */}
          <feBlend mode="screen" in="rg" in2="blue" />
        </filter>
      </defs>
    </svg>
  );
}
