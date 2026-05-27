/**
 * Original SVG illustrations inspired by Naruto Shippuden imagery.
 * All paths are hand-drawn — no traced art, no copyrighted assets.
 *
 * Each illustration accepts standard SVGProps so it can be sized and
 * styled with Tailwind classes.
 */

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

/* ------------------------------------------------------------------
   Sharingan eye — three-tomoe pattern
   ------------------------------------------------------------------ */
export function Sharingan({ size = 80, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <radialGradient id="sharingan-iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF1A1A" />
          <stop offset="60%" stopColor="#8B0000" />
          <stop offset="100%" stopColor="#3A0000" />
        </radialGradient>
      </defs>

      {/* Eye outline */}
      <ellipse
        cx="60"
        cy="60"
        rx="55"
        ry="34"
        stroke="#F0E6C8"
        strokeWidth="2"
        fill="#0A0A0F"
      />

      {/* Iris */}
      <circle cx="60" cy="60" r="28" fill="url(#sharingan-iris)" />

      {/* Outer ring */}
      <circle
        cx="60"
        cy="60"
        r="28"
        fill="none"
        stroke="#0A0A0F"
        strokeWidth="2"
      />

      {/* Three tomoe (comma-shaped marks) */}
      {[0, 120, 240].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 60 + Math.cos(rad) * 16;
        const cy = 60 + Math.sin(rad) * 16;
        return (
          <g
            key={angle}
            transform={`translate(${cx} ${cy}) rotate(${angle + 90})`}
          >
            <path
              d="M0 -7 Q 6 -7 6 0 Q 6 7 0 7 Q -3 7 -3 4 Q 0 4 0 1 Q -3 1 -3 -2 Q 0 -2 0 -7 Z"
              fill="#0A0A0F"
            />
          </g>
        );
      })}

      {/* Pupil */}
      <circle cx="60" cy="60" r="4" fill="#0A0A0F" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Konoha forehead protector (headband)
   ------------------------------------------------------------------ */
export function Headband({ size = 200, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size * 0.4}
      viewBox="0 0 200 80"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id="hb-cloth" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A4A8A" />
          <stop offset="100%" stopColor="#1A2540" />
        </linearGradient>
        <linearGradient id="hb-metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4D4D4" />
          <stop offset="50%" stopColor="#9A9A9A" />
          <stop offset="100%" stopColor="#6A6A6A" />
        </linearGradient>
      </defs>

      {/* Cloth band */}
      <rect x="0" y="20" width="200" height="40" fill="url(#hb-cloth)" />

      {/* Cloth threads */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1={i * 17}
          y1="20"
          x2={i * 17}
          y2="60"
          stroke="#0A0F1F"
          strokeWidth="0.5"
          opacity="0.4"
        />
      ))}

      {/* Cloth ends fluttering */}
      <path
        d="M0 25 L -8 30 L -10 38 L -6 45 L 0 50"
        stroke="#1A2540"
        strokeWidth="2"
        fill="#1A2540"
      />
      <path
        d="M200 25 L 208 32 L 212 42 L 206 50 L 200 55"
        stroke="#1A2540"
        strokeWidth="2"
        fill="#1A2540"
      />

      {/* Metal plate */}
      <rect
        x="60"
        y="14"
        width="80"
        height="52"
        rx="3"
        fill="url(#hb-metal)"
        stroke="#3A3A3A"
        strokeWidth="1.5"
      />

      {/* Bolts on plate */}
      {[
        [66, 20],
        [134, 20],
        [66, 60],
        [134, 60],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#3A3A3A" />
      ))}

      {/* Konoha leaf engraved */}
      <g transform="translate(100 40)">
        <path
          d="M0 -16 Q 8 -10 8 0 Q 8 8 0 10 Q -8 8 -8 0 Q -8 -10 0 -16 Z"
          fill="#3A3A3A"
        />
        <path
          d="M0 10 L 0 22"
          stroke="#3A3A3A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M0 4 Q 5 7 7 12"
          stroke="#9A9A9A"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Rasengan — spinning chakra sphere
   ------------------------------------------------------------------ */
export function Rasengan({ size = 100, animated = true, ...rest }: IconProps & { animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <radialGradient id="rg-core" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="20%" stopColor="#CCEEFF" />
          <stop offset="55%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#0066AA" />
        </radialGradient>
        <radialGradient id="rg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer glow */}
      <circle cx="60" cy="60" r="58" fill="url(#rg-glow)" />

      {/* Core sphere */}
      <circle cx="60" cy="60" r="34" fill="url(#rg-core)" />

      {/* Spiral chakra streams */}
      <g style={animated ? { animation: "rasengan-spin 2s linear infinite", transformOrigin: "60px 60px" } : undefined}>
        <path
          d="M60 26 Q 88 32, 92 60 Q 88 88, 60 94 Q 32 88, 28 60 Q 32 32, 60 26"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
          strokeDasharray="2 4"
        />
        <path
          d="M60 32 Q 82 38, 84 60 Q 82 82, 60 86 Q 38 82, 36 60 Q 38 38, 60 32"
          stroke="#CCEEFF"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
          strokeDasharray="3 3"
        />
      </g>

      {/* Highlight */}
      <ellipse cx="50" cy="48" rx="10" ry="6" fill="#FFFFFF" opacity="0.5" />

      <style>{`
        @keyframes rasengan-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Akatsuki cloud — repeating pattern element
   ------------------------------------------------------------------ */
export function AkatsukiCloud({ size = 60, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      {/* Five-petal cloud silhouette */}
      <path
        d="M50 20 Q 65 18, 70 32 Q 85 32, 82 50 Q 90 60, 78 72 Q 70 86, 55 80 Q 48 92, 35 84 Q 18 86, 18 68 Q 8 58, 18 44 Q 14 28, 32 28 Q 38 18, 50 20 Z"
        fill="#CC0000"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Hokage Rock — silhouette of the four Hokage faces carved in stone
   (stylized abstract — not portrait)
   ------------------------------------------------------------------ */
export function HokageRock({ width = 600, ...rest }: IconProps & { width?: number }) {
  return (
    <svg
      width={width}
      height={width * 0.3}
      viewBox="0 0 600 180"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      {...rest}
    >
      <defs>
        <linearGradient id="rock-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1815" />
          <stop offset="100%" stopColor="#0a0908" />
        </linearGradient>
      </defs>

      {/* Mountain base */}
      <path
        d="M0 180 L 0 120 L 60 90 L 100 100 L 140 60 L 200 80 L 260 50 L 320 70 L 380 45 L 440 75 L 500 65 L 560 95 L 600 110 L 600 180 Z"
        fill="url(#rock-grad)"
      />

      {/* Four head silhouettes */}
      {[100, 240, 380, 510].map((cx, i) => (
        <g key={cx}>
          <ellipse cx={cx} cy={100 + i * 2} rx="32" ry="38" fill="#0a0908" opacity="0.9" />
          <path
            d={`M ${cx - 32} ${100 + i * 2} Q ${cx - 28} ${78 + i * 2}, ${cx} ${72 + i * 2} Q ${cx + 28} ${78 + i * 2}, ${cx + 32} ${100 + i * 2}`}
            fill="#0a0908"
          />
          {/* Headband */}
          <rect x={cx - 28} y={92 + i * 2} width="56" height="4" fill="#1a2540" />
          <rect x={cx - 6} y={91 + i * 2} width="12" height="6" fill="#3a3a3a" />
        </g>
      ))}

      {/* Atmospheric haze */}
      <rect width="600" height="180" fill="url(#rock-grad)" opacity="0.3" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Sage Mode marks — eye markings
   ------------------------------------------------------------------ */
export function SageMarks({ size = 40, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size * 0.4}
      viewBox="0 0 100 40"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M5 20 Q 15 5, 30 18 Q 45 8, 55 22 Q 70 10, 85 20 Q 92 22, 95 25"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Scroll — used for mission cards / decorative
   ------------------------------------------------------------------ */
export function Scroll({ size = 32, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <rect x="6" y="8" width="20" height="16" rx="1" fill="#1f1a14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="12" x2="26" y2="12" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      <line x1="6" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      <line x1="3" y1="8" x2="3" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="29" y1="8" x2="29" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------
   Akatsuki cloud pattern — tileable background pattern
   ------------------------------------------------------------------ */
export function CloudPattern({ className, opacity = 0.04 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern id="akatsuki-tile" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <g transform="translate(20 20)">
            <path
              d="M30 8 Q 42 6, 46 18 Q 56 18, 54 32 Q 60 40, 50 48 Q 44 58, 32 54 Q 26 62, 16 56 Q 4 58, 4 44 Q -4 36, 4 26 Q 0 14, 14 14 Q 20 6, 30 8 Z"
              fill="#CC0000"
            />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#akatsuki-tile)" />
    </svg>
  );
}
