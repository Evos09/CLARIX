/*
  CLARIX logomark — the "C" monogram on a violet tile.
  Violet (#6D28D9) reads on both light (paper) and dark (ink) surfaces,
  so the same mark works in the app, sidebar, auth, and favicon.
*/
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="CLARIX"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#6D28D9" />
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fontFamily="var(--font-inter), system-ui, Arial, sans-serif"
        fontWeight="800"
        fontSize="21"
        fill="#FAFAF7"
      >
        C
      </text>
    </svg>
  );
}
