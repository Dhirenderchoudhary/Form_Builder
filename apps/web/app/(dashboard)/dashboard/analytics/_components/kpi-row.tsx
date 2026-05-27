import { Eye, Users, Send, Timer, Target } from "lucide-react";

interface Summary {
  totalViews: number;
  uniqueViews: number;
  totalStarts: number;
  totalSubmissions: number;
  completionRate: number;
  avgCompletionTimeMs: number | null;
}

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  if (min < 60) return remSec ? `${min}m ${remSec}s` : `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function KpiRow({ summary, loading }: { summary?: Summary; loading?: boolean }) {
  const items = [
    {
      label: "Total views",
      value: summary?.totalViews ?? 0,
      hint: `${summary?.uniqueViews ?? 0} unique`,
      icon: Eye,
      accent: "chakra" as const,
    },
    {
      label: "Started",
      value: summary?.totalStarts ?? 0,
      hint: "Began filling",
      icon: Users,
      accent: "gold" as const,
    },
    {
      label: "Submissions",
      value: summary?.totalSubmissions ?? 0,
      hint: "Scrolls sealed",
      icon: Send,
      accent: "orange" as const,
    },
    {
      label: "Completion rate",
      value: summary ? `${summary.completionRate}%` : "0%",
      hint: "Of views that submit",
      icon: Target,
      accent: "crimson" as const,
    },
    {
      label: "Avg time",
      value: formatDuration(summary?.avgCompletionTimeMs ?? null),
      hint: "From start to seal",
      icon: Timer,
      accent: "gold" as const,
    },
  ];

  const accentMap = {
    orange: {
      iconBg: "border-konoha-orange/40 bg-konoha-orange/10 text-konoha-orange",
      valueColor: "text-konoha-orange",
    },
    chakra: {
      iconBg: "border-konoha-chakra/40 bg-konoha-chakra/10 text-konoha-chakra",
      valueColor: "text-konoha-chakra",
    },
    gold: {
      iconBg: "border-konoha-gold/40 bg-konoha-gold/10 text-konoha-gold",
      valueColor: "text-konoha-gold",
    },
    crimson: {
      iconBg: "border-konoha-akatsuki/40 bg-konoha-akatsuki/10 text-konoha-akatsuki",
      valueColor: "text-konoha-akatsuki",
    },
  } as const;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const a = accentMap[item.accent];
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="scroll-card flex flex-col gap-3 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {item.label}
              </p>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${a.iconBg}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            {loading ? (
              <div className="h-7 w-16 animate-pulse rounded bg-konoha-forest/40" />
            ) : (
              <p className={`font-heading text-2xl font-black tabular-nums leading-none ${a.valueColor}`}>
                {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
              </p>
            )}

            <p className="text-[10px] leading-snug text-muted-foreground">
              {item.hint}
            </p>
          </div>
        );
      })}
    </div>
  );
}
