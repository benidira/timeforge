/** The TimeForge mark: a clock face whose hand is cut by a forge-spark notch. */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="#4f46e5" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="#ffffff" strokeWidth="2.2" />
      <path d="M16 10.5V16l3.6 2.4" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
