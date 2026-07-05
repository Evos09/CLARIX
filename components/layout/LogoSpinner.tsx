/*
  Animated CLARIX logomark — the cream "C" spins around the tile's center as a
  branded loading indicator. Drop-in replacement for a generic spinner (e.g.
  while Ask CLARIX is generating a response). Uses SMIL so it's self-contained,
  needs no keyframes, and rotates precisely around the arc's center (16,16).
*/
export function LogoSpinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="CLARIX is thinking"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#6D28D9" />
      <path
        d="M22.89 10.21 A9 9 0 1 0 22.89 21.79"
        fill="none"
        stroke="#FAFAF7"
        strokeWidth="5"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 16 16"
          to="360 16 16"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
