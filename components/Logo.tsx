// Tilik brand mark: a magnifier whose lens holds three ascending value bars.
type MarkProps = { size?: number; variant?: "gradient" | "ink" | "reversed" | "white"; className?: string };

export function Mark({ size = 32, variant = "gradient", className }: MarkProps) {
  const id = `tg-${variant}`;
  const ring =
    variant === "ink" ? "#12101a" : variant === "reversed" || variant === "white" ? "#fff" : `url(#${id})`;
  const bars =
    variant === "ink"
      ? ["#12101a", "#12101a", "#12101a"]
      : variant === "white"
        ? ["#fff", "#fff", "#fff"]
        : variant === "reversed"
          ? ["#a78bfa", "#f25fa8", "#f7c948"]
          : ["#6c3bf4", "#f25fa8", "#f7c948"];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      {variant === "gradient" && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6c3bf4" />
            <stop offset="1" stopColor="#f25fa8" />
          </linearGradient>
        </defs>
      )}
      <circle cx="42" cy="42" r="29" fill="none" stroke={ring} strokeWidth="10" />
      <line x1="61" y1="61" x2="84" y2="84" stroke={ring} strokeWidth="12" strokeLinecap="round" />
      <rect x="30" y="44" width="7.5" height="12" rx="2.2" fill={bars[0]} />
      <rect x="40.5" y="37" width="7.5" height="19" rx="2.2" fill={bars[1]} />
      <rect x="51" y="30" width="7.5" height="26" rx="2.2" fill={bars[2]} />
    </svg>
  );
}

// Gradient-filled rounded tile with the mark in white (app icon / nav badge).
export function MarkTile({ size = 34, radius = 9, className }: { size?: number; radius?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="tg-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6c3bf4" />
          <stop offset="1" stopColor="#f25fa8" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx={(radius / size) * 120} fill="url(#tg-tile)" />
      <circle cx="52" cy="52" r="29" fill="none" stroke="#fff" strokeWidth="9" />
      <line x1="71" y1="71" x2="92" y2="92" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
      <rect x="40" y="54" width="7" height="11" rx="2" fill="#fff" opacity="0.7" />
      <rect x="50" y="47" width="7" height="18" rx="2" fill="#fff" opacity="0.85" />
      <rect x="60" y="40" width="7" height="25" rx="2" fill="#fff" />
    </svg>
  );
}

export function Wordmark({
  tileSize = 30,
  textSize = 22,
  dark = false,
  className,
}: {
  tileSize?: number;
  textSize?: number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <MarkTile size={tileSize} radius={9} />
      <span
        className="font-display font-bold leading-none"
        style={{ fontSize: textSize, letterSpacing: "-0.04em", color: dark ? "#fff" : "#12101a" }}
      >
        tilik
      </span>
    </span>
  );
}
