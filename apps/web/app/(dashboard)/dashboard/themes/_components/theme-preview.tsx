"use client";

import { Star } from "lucide-react";

interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  error: string;
}

interface Props {
  colors: ThemeColors;
  fonts?: { heading: string; body: string };
  /** Whether to render a compact one-row preview (used in lists) or a full card. */
  compact?: boolean;
}

/**
 * Live mini-preview of a theme. Renders a fake form using the theme's
 * actual colors so users see exactly what their scrolls will look like.
 *
 * Uses inline styles (not Tailwind) because Tailwind can't compile arbitrary
 * runtime color values without unsafe `style` plumbing anyway.
 */
export function ThemePreview({ colors, fonts, compact }: Props) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-2 rounded-md p-2"
        style={{
          background: colors.background,
          border: `1px solid ${colors.border}`,
        }}
      >
        {[colors.primary, colors.accent, colors.text].map((c, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-full"
            style={{ background: c, boxShadow: `0 0 6px ${c}80` }}
          />
        ))}
        <span
          className="ml-1 truncate text-[10px] uppercase tracking-[0.2em]"
          style={{ color: colors.textMuted, fontFamily: fonts?.body }}
        >
          Aa Bb Cc
        </span>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-md"
      style={{
        background: colors.background,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-1.5 border-b px-3 py-2"
        style={{ borderColor: colors.border }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            background: colors.primary,
            boxShadow: `0 0 6px ${colors.primary}`,
          }}
        />
        <span
          className="text-[8px] font-medium uppercase tracking-[0.3em]"
          style={{ color: colors.textMuted, fontFamily: fonts?.body }}
        >
          Live preview
        </span>
      </div>

      {/* Inner card */}
      <div
        className="m-3 rounded-md p-4"
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Heading */}
        <div
          className="text-[8px] uppercase tracking-[0.3em] mb-1"
          style={{ color: colors.primary }}
        >
          Mission · 任務
        </div>
        <div
          className="text-base font-bold leading-tight"
          style={{
            color: colors.text,
            fontFamily: fonts?.heading,
          }}
        >
          Hidden Leaf Scroll
        </div>

        {/* Hairline */}
        <div
          className="my-3 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          }}
        />

        {/* Faux input */}
        <div className="mb-2">
          <div
            className="mb-1 text-[7px] font-medium uppercase tracking-[0.25em]"
            style={{ color: colors.textMuted }}
          >
            Shinobi name
          </div>
          <div
            className="h-7 rounded px-2 text-[10px]"
            style={{
              background: colors.background,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontFamily: fonts?.body,
              lineHeight: "1.5rem",
            }}
          >
            Naruto Uzumaki
          </div>
        </div>

        {/* Faux rating */}
        <div className="mb-3">
          <div
            className="mb-1 text-[7px] font-medium uppercase tracking-[0.25em]"
            style={{ color: colors.textMuted }}
          >
            Mastery
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={10}
                fill={i <= 4 ? colors.primary : "transparent"}
                stroke={i <= 4 ? colors.primary : colors.border}
                strokeWidth={1.5}
              />
            ))}
          </div>
        </div>

        {/* Faux button */}
        <div
          className="flex h-7 items-center justify-center rounded px-3 text-[8px] font-bold uppercase tracking-[0.18em]"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.error})`,
            color: "#fff",
            fontFamily: fonts?.heading,
            boxShadow: `0 0 12px ${colors.primary}40`,
          }}
        >
          Submit Scroll
        </div>
      </div>

      {/* Color swatches */}
      <div
        className="flex items-center gap-1 border-t px-3 py-2"
        style={{ borderColor: colors.border }}
      >
        {[
          { name: "primary", c: colors.primary },
          { name: "accent", c: colors.accent },
          { name: "surface", c: colors.surface },
          { name: "text", c: colors.text },
        ].map((s) => (
          <div
            key={s.name}
            className="flex h-4 w-4 items-center justify-center rounded"
            style={{
              background: s.c,
              border: `1px solid ${colors.border}`,
              boxShadow: `0 0 4px ${s.c}40`,
            }}
            title={`${s.name}: ${s.c}`}
          />
        ))}
        <span
          className="ml-auto font-mono text-[8px]"
          style={{ color: colors.textMuted }}
        >
          {colors.primary}
        </span>
      </div>
    </div>
  );
}
