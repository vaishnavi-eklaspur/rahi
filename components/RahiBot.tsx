// Rahi — a minimal line-drawn companion. Single-weight ink strokes (currentColor,
// so it inherits the text colour in light/dark) with one small clay accent.
// Kept the same props as before (size, mood, className) so callers don't change.
export default function RahiBot({
  size = 96,
  mood = "happy",
  className = "",
}: {
  size?: number;
  mood?: "happy" | "cheer" | "wave" | "think";
  className?: string;
}) {
  const CLAY = "#ff6b4a"; // coral accent
  const mouth =
    mood === "cheer"
      ? <path d="M49 66 Q60 77 71 66" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      : mood === "think"
        ? <path d="M54 69 h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        : <path d="M52 68 Q60 74 68 68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />;
  const wave = mood === "wave" || mood === "cheer";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Rahi, your guide"
    >
      {/* antenna */}
      <line x1="60" y1="26" x2="60" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="14" r="3.4" fill={CLAY} />
      {/* body — a calm rounded stone */}
      <rect x="30" y="26" width="60" height="62" rx="26" stroke="currentColor" strokeWidth="3.4" fill="none" />
      {/* little feet */}
      <line x1="48" y1="88" x2="48" y2="96" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="72" y1="88" x2="72" y2="96" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      {/* raised hand when waving */}
      {wave && (
        <path d="M90 52 q10 -4 12 -14" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      )}
      {/* eyes */}
      <circle cx="50" cy={mood === "think" ? 55 : 57} r="3.4" fill="currentColor" />
      <circle cx="70" cy={mood === "think" ? 55 : 57} r="3.4" fill="currentColor" />
      {/* think dot */}
      {mood === "think" && <circle cx="86" cy="40" r="2.4" fill={CLAY} />}
      {mouth}
      {/* accent spark */}
      <path
        d="M97 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z"
        fill={CLAY}
        opacity={mood === "cheer" ? 1 : 0.85}
      />
    </svg>
  );
}
