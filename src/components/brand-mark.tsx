export function BrandMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Hexagon */}
      <path
        d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-fg"
      />
      {/* Inner Accent Geometry */}
      <path
        d="M16 2L16 16L3 22.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
      />
      <path
        d="M16 16L29 9.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent opacity-50"
      />
    </svg>
  );
}
