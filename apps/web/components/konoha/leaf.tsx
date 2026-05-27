interface KonohaLeafProps {
  size?: number;
  color?: string;
  className?: string;
  glow?: boolean;
}


export function KonohaLeaf({
  size = 40,
  color = "#FF6B00",
  className,
  glow = false,
}: KonohaLeafProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={glow ? { filter: `drop-shadow(0 0 12px ${color}80)` } : undefined}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`leaf-grad-${color.replace("#", "")}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#leaf-grad-${color.replace("#", "")})`} />
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="2.5" />

      <path
        d="M50 18 Q 64 28, 64 44 Q 64 58, 50 60 Q 36 58, 36 44 Q 36 28, 50 18 Z"
        fill={color}
      />

      <path d="M50 60 L 50 82" stroke={color} strokeWidth="4" strokeLinecap="round" />

      <path
        d="M50 50 Q 60 56, 64 64"
        fill="none"
        stroke="#0A0A0F"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}


export function Shuriken({
  size = 18,
  color = "currentColor",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 3 L 14 10 L 21 12 L 14 14 L 12 21 L 10 14 L 3 12 L 10 10 Z"
        fill={color}
      />
      <circle cx="12" cy="12" r="1.5" fill="#0A0A0F" />
    </svg>
  );
}


export function Kunai({
  size = 16,
  color = "currentColor",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2 L 14 6 L 14 16 L 16 18 L 13 21 L 12 22 L 11 21 L 8 18 L 10 16 L 10 6 Z"
        fill={color}
      />
      <circle cx="12" cy="19" r="1.5" fill="none" stroke={color} strokeWidth="1" />
    </svg>
  );
}
