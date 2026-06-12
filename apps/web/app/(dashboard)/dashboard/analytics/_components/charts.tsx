"use client";

/**
 * Hand-rolled SVG charts. No chart library — gives us full control of
 * the Konoha aesthetic and keeps the bundle lean.
 */

interface DailyPoint {
  date: string;
  count: number;
}

/* ------------------------------------------------------------------
   Daily trend area chart
   ------------------------------------------------------------------ */
export function DailyTrendChart({ data, height = 220 }: { data: DailyPoint[]; height?: number }) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-md border border-dashed border-konoha-forest/60"
        style={{ height }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          No submissions yet
        </p>
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.count));
  const padding = { top: 16, right: 16, bottom: 28, left: 32 };
  const width = 800;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Spread points across width
  const xStep = data.length > 1 ? innerW / (data.length - 1) : 0;
  const points = data.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + innerH - (d.count / max) * innerH,
    value: d.count,
    label: d.date,
  }));

  // Smooth path using cubic Bezier midpoint approximation
  const linePath = points
    .map((p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = arr[i - 1]!;
      const cx = (prev.x + p.x) / 2;
      return `Q ${cx} ${prev.y}, ${cx} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaPath =
    linePath +
    ` L ${points[points.length - 1]!.x} ${padding.top + innerH}` +
    ` L ${points[0]!.x} ${padding.top + innerH} Z`;

  // Y-axis tick marks
  const ticks = [0, max / 2, max].map((v) => Math.round(v));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid */}
        {ticks.map((tick, i) => {
          const y = padding.top + innerH - (tick / max) * innerH;
          return (
            <g key={`grid-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#2A4A2A"
                strokeWidth="0.5"
                strokeDasharray="2 4"
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#8A9A7A"
                fontFamily="system-ui"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#trend-fill)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#FF6B00"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points + tooltips */}
        {points.map((p, i) => {
          // X-axis labels — show only first, middle, last for readability
          const showLabel =
            data.length <= 7 ||
            i === 0 ||
            i === points.length - 1 ||
            i === Math.floor(points.length / 2);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3" fill="#FF6B00" />
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill="transparent"
                stroke="#FF6B00"
                strokeOpacity="0.3"
              >
                <title>{`${p.label}: ${p.value}`}</title>
              </circle>
              {showLabel && (
                <text
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#8A9A7A"
                  fontFamily="system-ui"
                >
                  {formatDateShort(p.label)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ------------------------------------------------------------------
   Funnel chart — Views → Starts → Submissions
   ------------------------------------------------------------------ */
export function Funnel({
  views,
  starts,
  submissions,
}: {
  views: number;
  starts: number;
  submissions: number;
}) {
  const max = Math.max(views, starts, submissions, 1);

  const stages = [
    {
      label: "Views",
      sublabel: "Scrolls opened",
      value: views,
      color: "#00D4FF",
    },
    {
      label: "Starts",
      sublabel: "Began filling",
      value: starts,
      pct: views > 0 ? Math.round((starts / views) * 100) : 0,
      color: "#FFD700",
    },
    {
      label: "Submissions",
      sublabel: "Sealed and sent",
      value: submissions,
      pct: views > 0 ? Math.round((submissions / views) * 100) : 0,
      color: "#FF6B00",
    },
  ];

  return (
    <div className="space-y-3">
      {stages.map((s) => {
        const widthPct = (s.value / max) * 100;
        return (
          <div key={s.label}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                  {s.label}
                </p>
                <p className="text-[10px] text-muted-foreground/60">{s.sublabel}</p>
              </div>
              <div className="text-right">
                <p
                  className="text-xl font-black tabular-nums leading-none"
                  style={{ color: s.color }}
                >
                  {s.value.toLocaleString()}
                </p>
                {s.pct !== undefined && (
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.pct}% of views
                  </p>
                )}
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-konoha-forest/30">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${s.color}, ${s.color}80)`,
                  boxShadow: `0 0 12px ${s.color}40`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------
   Compact horizontal bar list — for top referrers and countries
   ------------------------------------------------------------------ */
export function BarList({
  items,
  emptyLabel,
}: {
  items: { label: string; count: number }[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70 py-6">
        {emptyLabel}
      </p>
    );
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const pct = (item.count / max) * 100;
        return (
          <li key={item.label || `item-${i}`} className="group relative">
            <div
              className="absolute inset-y-0 left-0 rounded bg-konoha-orange/10 transition-all group-hover:bg-konoha-orange/20"
              style={{ width: `${pct}%` }}
            />
            <div className="relative flex items-center justify-between gap-3 px-2.5 py-1.5">
              <span className="truncate text-xs text-foreground">
                {item.label || "—"}
              </span>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-konoha-orange">
                {item.count.toLocaleString()}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------
   Donut chart — for choice distributions (pie/bar chart substitute)
   ------------------------------------------------------------------ */
export function DonutChart({
  items,
  emptyLabel,
}: {
  items: { label: string; count: number }[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70 py-6">
        {emptyLabel}
      </p>
    );
  }

  const total = items.reduce((sum, item) => sum + item.count, 0);
  const colors = [
    "#FF6B00", // konoha-orange
    "#00D4FF", // chakra
    "#FFD700", // gold
    "#DC143C", // crimson
    "#32CD32", // green
    "#8A2BE2", // purple
    "#FF1493", // pink
  ];

  let currentOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90 transform">
          {items.map((item, i) => {
            const pct = (item.count / total) * 100;
            // The circumference of a circle with r=15.9155 is ~100
            const strokeDasharray = `${pct} ${100 - pct}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += pct;

            return (
              <circle
                key={i}
                cx="20"
                cy="20"
                r="15.91549430918954"
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth="6"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
              >
                <title>{`${item.label}: ${item.count} (${Math.round(pct)}%)`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col leading-none">
          <span className="text-lg font-black text-foreground">{total}</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-2">
        {items.map((item, i) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="truncate text-muted-foreground" title={item.label}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-muted-foreground/60 w-8 text-right">
                  {pct}%
                </span>
                <span className="font-mono text-[11px] text-konoha-orange w-6 text-right">
                  {item.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
