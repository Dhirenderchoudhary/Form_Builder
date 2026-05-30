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
export function Rasengan({ size = 100, animated = true, className = "", ...rest }: IconProps & { animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={`${animated ? "spinning-rasengan" : ""} ${className}`}
      {...rest}
    >
      <defs>
        {/* Soft Aura */}
        <radialGradient id="rasengan-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="25%" stopColor="#ccffff" stopOpacity="0.8" />
          <stop offset="55%" stopColor="#00d4ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0066ff" stopOpacity="0" />
        </radialGradient>
        
        {/* Intense Core */}
        <radialGradient id="rasengan-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#e0ffff" />
          <stop offset="100%" stopColor="#88ddff" stopOpacity="0" />
        </radialGradient>

        <filter id="glow-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="core-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Massive soft aura */}
      <circle cx="60" cy="60" r="50" fill="url(#rasengan-aura)" />
      
      {/* Heavy blurred core glow */}
      <circle cx="60" cy="60" r="30" fill="#ffffff" filter="url(#core-blur)" />
      <circle cx="60" cy="60" r="22" fill="url(#rasengan-core)" />
      <circle cx="60" cy="60" r="14" fill="#ffffff" />

      {/* 
        Chaotic Chakra Swirls 
        We use intricate, twisting paths instead of perfect ellipses 
        so it looks like a turbulent ball of energy, not an atom.
      */}
      
      <g style={animated ? { animation: "spin-fast 0.5s linear infinite", transformOrigin: "60px 60px" } : undefined}>
        {/* Dense Inner Swirls */}
        <path d="M 60 25 C 85 25, 90 45, 80 70 C 70 95, 45 85, 35 60 C 25 35, 45 25, 60 25" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.9" filter="url(#glow-blur)" />
        <path d="M 30 50 C 40 20, 80 20, 90 50 C 100 80, 70 100, 40 90 C 10 80, 20 50, 30 50" stroke="#ccffff" strokeWidth="2" fill="none" opacity="0.6" filter="url(#glow-blur)" strokeDasharray="20 10 5 15" />
        
        {/* Jagged Energy */}
        <path d="M 40 20 Q 60 40, 85 25 T 90 60 Q 70 50, 45 80 T 25 50 Z" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.7" />
        <path d="M 45 35 Q 75 35, 80 65 T 45 85 Q 35 60, 45 35" stroke="#00ffff" strokeWidth="2.5" fill="none" opacity="0.4" filter="url(#glow-blur)" />
      </g>

      <g style={animated ? { animation: "spin-reverse 0.7s linear infinite", transformOrigin: "60px 60px" } : undefined}>
        {/* Mid-layer Swirls */}
        <path d="M 60 15 C 100 20, 95 80, 60 95 C 25 110, 15 45, 60 15" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.8" strokeDasharray="15 25" strokeLinecap="round" />
        <path d="M 25 70 C 15 40, 50 15, 85 35 C 120 55, 95 100, 60 90 C 25 80, 20 60, 25 70" stroke="#88ddff" strokeWidth="3" fill="none" opacity="0.5" filter="url(#glow-blur)" />
        
        <path d="M 35 45 Q 60 10, 85 40 T 70 85 Q 40 100, 25 70 T 35 45" stroke="#ffffff" strokeWidth="0.8" fill="none" opacity="0.9" />
      </g>

      <g style={animated ? { animation: "spin-fast 0.4s linear infinite", transformOrigin: "60px 60px" } : undefined}>
        {/* Outer Wisps & Sparks */}
        <path d="M 20 60 C 20 30, 60 18, 90 40" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.6" strokeDasharray="8 20" strokeLinecap="round" />
        <path d="M 100 60 C 100 90, 60 105, 30 85" stroke="#00d4ff" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="15 30" strokeLinecap="round" filter="url(#glow-blur)" />
        
        {/* Rapid Orbits */}
        <ellipse cx="60" cy="60" rx="42" ry="38" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="5 45 15 25" transform="rotate(45 60 60)" />
        <ellipse cx="60" cy="60" rx="40" ry="35" stroke="#ccffff" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="30 60" transform="rotate(-20 60 60)" filter="url(#glow-blur)" />
      </g>
      
      {/* High-speed particles orbiting the core */}
      <g style={animated ? { animation: "spin-reverse 0.9s linear infinite", transformOrigin: "60px 60px" } : undefined}>
        <circle cx="28" cy="45" r="2" fill="#ffffff" />
        <circle cx="85" cy="75" r="3" fill="#ffffff" filter="url(#glow-blur)" />
        <circle cx="65" cy="20" r="1.5" fill="#ccffff" />
        <circle cx="35" cy="90" r="2.5" fill="#00d4ff" opacity="0.8" />
        <circle cx="95" cy="40" r="1.5" fill="#ffffff" />
      </g>

      <style>{`
        @keyframes spin-fast {
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          to { transform: rotate(-360deg); }
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
      style={{ opacity, willChange: "transform" }}
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
