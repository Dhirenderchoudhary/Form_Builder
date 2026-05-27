/**
 * Original stylized character silhouettes inspired by Naruto Shippuden.
 * These are abstract impressions — geometric shapes, no traced lineart,
 * no copyright issues. Each character uses recognizable signature elements
 * (Itachi's Akatsuki cloak collar + Sharingan, Kakashi's mask + headband
 * tilt, etc.) rendered as simple paths.
 */

type CharProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

/* ------------------------------------------------------------------
   Itachi — Akatsuki cloak silhouette with Sharingan eye
   Used as the dashboard's signature character.
   ------------------------------------------------------------------ */
export function ItachiSilhouette({ size = 220, ...rest }: CharProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id="itachi-cloak" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a0a0a" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <radialGradient id="itachi-iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF1A1A" />
          <stop offset="100%" stopColor="#8B0000" />
        </radialGradient>
      </defs>

      {/* Cloak body — high collar */}
      <path
        d="M40 240 L 40 160 Q 40 130, 60 120 L 60 90 Q 100 60, 140 90 L 140 120 Q 160 130, 160 160 L 160 240 Z"
        fill="url(#itachi-cloak)"
      />

      {/* Akatsuki cloud — small accent on collar */}
      <g transform="translate(70 145) scale(0.4)">
        <path
          d="M30 8 Q 42 6, 46 18 Q 56 18, 54 32 Q 60 40, 50 48 Q 44 58, 32 54 Q 26 62, 16 56 Q 4 58, 4 44 Q -4 36, 4 26 Q 0 14, 14 14 Q 20 6, 30 8 Z"
          fill="#CC0000"
          stroke="#fff"
          strokeWidth="2"
        />
      </g>
      <g transform="translate(115 145) scale(0.4)">
        <path
          d="M30 8 Q 42 6, 46 18 Q 56 18, 54 32 Q 60 40, 50 48 Q 44 58, 32 54 Q 26 62, 16 56 Q 4 58, 4 44 Q -4 36, 4 26 Q 0 14, 14 14 Q 20 6, 30 8 Z"
          fill="#CC0000"
          stroke="#fff"
          strokeWidth="2"
        />
      </g>

      {/* Head shadow */}
      <ellipse cx="100" cy="85" rx="32" ry="36" fill="#0a0608" />

      {/* Hair (long, parted) */}
      <path
        d="M68 75 Q 65 50, 80 42 L 100 38 L 120 42 Q 135 50, 132 75 L 130 90 L 125 70 Q 115 65, 100 65 Q 85 65, 75 70 L 70 90 Z"
        fill="#1a1418"
      />

      {/* Hair strands falling */}
      <path d="M70 92 L 65 130 L 70 132 L 74 95 Z" fill="#1a1418" />
      <path d="M130 92 L 135 130 L 130 132 L 126 95 Z" fill="#1a1418" />

      {/* Face — visible portion */}
      <path
        d="M78 80 Q 78 110, 100 116 Q 122 110, 122 80"
        fill="#d4b896"
      />

      {/* Sharingan eyes */}
      <g>
        <ellipse cx="88" cy="88" rx="6" ry="4" fill="url(#itachi-iris)" />
        <circle cx="88" cy="88" r="1.5" fill="#000" />
        <ellipse cx="112" cy="88" rx="6" ry="4" fill="url(#itachi-iris)" />
        <circle cx="112" cy="88" r="1.5" fill="#000" />
      </g>

      {/* Tear-trough lines under eyes (Itachi's signature) */}
      <path d="M82 95 Q 88 100, 92 97" stroke="#5a3a30" strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M108 97 Q 112 100, 118 95" stroke="#5a3a30" strokeWidth="1" fill="none" opacity="0.7" />

      {/* Konoha headband (slashed — tilted line indicates the slash) */}
      <rect x="68" y="60" width="64" height="10" fill="#1a2540" />
      <rect x="92" y="58" width="16" height="14" fill="#9a9a9a" />
      <line x1="92" y1="58" x2="108" y2="72" stroke="#0a0a0f" strokeWidth="1.5" />

      {/* Subtle floating crow feather (Itachi's signature) */}
      <g transform="translate(160 60)" opacity="0.6">
        <path
          d="M0 0 Q 8 4, 10 14 Q 6 12, 4 8 Q 8 16, 4 20 Q 0 14, -2 8 Q 2 4, 0 0 Z"
          fill="#0a0a0f"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Kakashi — masked profile with tilted headband over left eye
   ------------------------------------------------------------------ */
export function KakashiSilhouette({ size = 200, ...rest }: CharProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id="kakashi-vest" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a3a1a" />
          <stop offset="100%" stopColor="#0a1a0a" />
        </linearGradient>
      </defs>

      {/* Jonin vest */}
      <path
        d="M50 240 L 50 170 Q 50 150, 70 145 L 70 130 Q 100 110, 130 130 L 130 145 Q 150 150, 150 170 L 150 240 Z"
        fill="url(#kakashi-vest)"
      />

      {/* Vest pockets */}
      <rect x="62" y="175" width="22" height="28" fill="#0a1a0a" stroke="#2a4a2a" strokeWidth="1" />
      <rect x="116" y="175" width="22" height="28" fill="#0a1a0a" stroke="#2a4a2a" strokeWidth="1" />

      {/* Head silhouette */}
      <ellipse cx="100" cy="80" rx="34" ry="38" fill="#0a0608" />

      {/* Hair (gravity-defying spike) */}
      <path
        d="M65 70 Q 60 35, 75 30 L 90 40 L 100 28 L 115 38 L 130 32 Q 140 40, 138 75 L 130 60 Q 115 55, 100 60 Q 85 55, 70 62 Z"
        fill="#c8c8c8"
      />

      {/* Mask (covers bottom half of face) */}
      <path
        d="M70 90 Q 70 120, 100 122 Q 130 120, 130 90 L 130 95 Q 100 110, 70 95 Z"
        fill="#1a2540"
      />

      {/* Visible right eye */}
      <ellipse cx="115" cy="82" rx="5" ry="3" fill="#0a0a0f" />

      {/* Konoha headband — TILTED to cover left eye (Kakashi's signature) */}
      <g transform="translate(100 70) rotate(-12) translate(-100 -70)">
        <rect x="60" y="55" width="80" height="14" fill="#1a2540" />
        <rect x="78" y="52" width="22" height="20" fill="#9a9a9a" />
        {/* Konoha leaf engraved */}
        <path
          d="M89 60 Q 92 56, 94 60 Q 92 65, 89 65 Z M 89 65 L 89 70"
          fill="#3a3a3a"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------
   Naruto — sage mode profile
   ------------------------------------------------------------------ */
export function NarutoSilhouette({ size = 200, ...rest }: CharProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 240"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      {/* Orange jumpsuit shoulders */}
      <path
        d="M50 240 L 50 170 Q 50 150, 75 142 L 75 125 Q 100 105, 125 125 L 125 142 Q 150 150, 150 170 L 150 240 Z"
        fill="#FF6B00"
      />

      {/* Black accent stripes */}
      <rect x="50" y="175" width="100" height="4" fill="#0a0a0f" />
      <rect x="78" y="135" width="44" height="8" fill="#0a0a0f" />

      {/* Head */}
      <ellipse cx="100" cy="80" rx="34" ry="38" fill="#0a0608" />

      {/* Spiky blond hair */}
      <path
        d="M62 70 L 56 38 L 72 48 L 82 28 L 92 42 L 100 22 L 108 42 L 118 28 L 128 48 L 144 38 L 138 75 L 128 60 Q 100 55, 72 60 Z"
        fill="#FFD700"
      />

      {/* Face */}
      <path d="M72 86 Q 72 116, 100 120 Q 128 116, 128 86" fill="#f4d4b0" />

      {/* Sage-mode eye marks (orange around eyes) */}
      <ellipse cx="86" cy="92" rx="9" ry="5" fill="#FF6B00" opacity="0.4" />
      <ellipse cx="114" cy="92" rx="9" ry="5" fill="#FF6B00" opacity="0.4" />

      {/* Eyes — toad-sage horizontal pupils */}
      <ellipse cx="86" cy="92" rx="3" ry="1.5" fill="#0a0a0f" />
      <ellipse cx="114" cy="92" rx="3" ry="1.5" fill="#0a0a0f" />

      {/* Whisker marks (3 per cheek) */}
      {[88, 92, 96].map((y, i) => (
        <line key={`l-${y}`} x1="68" y1={y} x2="78" y2={y + i * 0.5} stroke="#5a3a30" strokeWidth="1.2" />
      ))}
      {[88, 92, 96].map((y, i) => (
        <line key={`r-${y}`} x1="122" y1={y} x2="132" y2={y + i * 0.5} stroke="#5a3a30" strokeWidth="1.2" />
      ))}

      {/* Mouth */}
      <path d="M92 108 Q 100 113, 108 108" stroke="#5a3a30" strokeWidth="1.5" fill="none" />

      {/* Headband */}
      <rect x="64" y="58" width="72" height="12" fill="#1a2540" />
      <rect x="92" y="56" width="16" height="16" fill="#9a9a9a" />
      <path d="M97 60 Q 100 57, 103 60 Q 100 65, 97 64 Z M 100 65 L 100 70" fill="#3a3a3a" />
    </svg>
  );
}
