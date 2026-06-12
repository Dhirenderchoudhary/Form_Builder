import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  loading?: boolean;
  accent?: "orange" | "chakra" | "gold" | "crimson";
}

const accentMap = {
  orange: {
    border: "hover:border-konoha-orange/50",
    iconBg: "border-konoha-orange/40 bg-konoha-orange/10 text-konoha-orange",
    glow: "group-hover:shadow-[0_0_24px_rgba(255,107,0,0.15)]",
    valueColor: "text-konoha-orange",
  },
  chakra: {
    border: "hover:border-konoha-chakra/50",
    iconBg: "border-konoha-chakra/40 bg-konoha-chakra/10 text-konoha-chakra",
    glow: "group-hover:shadow-[0_0_24px_rgba(0,212,255,0.15)]",
    valueColor: "text-konoha-chakra",
  },
  gold: {
    border: "hover:border-konoha-gold/50",
    iconBg: "border-konoha-gold/40 bg-konoha-gold/10 text-konoha-gold",
    glow: "group-hover:shadow-[0_0_24px_rgba(255,215,0,0.15)]",
    valueColor: "text-konoha-gold",
  },
  crimson: {
    border: "hover:border-konoha-akatsuki/50",
    iconBg: "border-konoha-akatsuki/40 bg-konoha-akatsuki/10 text-konoha-akatsuki",
    glow: "group-hover:shadow-[0_0_24px_rgba(139,0,0,0.15)]",
    valueColor: "text-konoha-akatsuki",
  },
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  loading,
  accent = "orange",
}: StatCardProps) {
  const a = accentMap[accent];

  return (
    <div
      className={`scroll-card group relative flex flex-col gap-3 p-5 transition-all ${a.border} ${a.glow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </p>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${a.iconBg}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-konoha-forest/40" />
        ) : (
          <span
            className={`text-3xl font-black tabular-nums leading-none ${a.valueColor}`}
          >
            {value}
          </span>
        )}
      </div>

      {hint && !loading && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
