"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { KpiRow } from "../_components/kpi-row";
import { DailyTrendChart, Funnel, BarList } from "../_components/charts";
import { ResponsesTable } from "../_components/responses-table";
import { CsvExport } from "../_components/csv-export";

interface Props {
  params: Promise<{ formId: string }>;
}

const RANGES = [
  { id: "7d", label: "7 days", days: 7 },
  { id: "30d", label: "30 days", days: 30 },
  { id: "90d", label: "90 days", days: 90 },
  { id: "all", label: "All time", days: 0 },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

export default function FormAnalyticsPage({ params }: Props) {
  const { formId } = use(params);
  const [range, setRange] = useState<RangeId>("30d");

  const formQuery = trpc.forms.get.useQuery({ formId });

  const rangeFilter = (() => {
    const days = RANGES.find((r) => r.id === range)?.days ?? 0;
    if (days === 0) return {};
    const from = new Date();
    from.setDate(from.getDate() - days);
    return { from: from.toISOString() };
  })();

  const analyticsQuery = trpc.forms.analytics.useQuery({ formId, ...rangeFilter });

  if (formQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-konoha-orange" />
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Reading the chakra…
        </p>
      </div>
    );
  }

  if (formQuery.isError || !formQuery.data) {
    return (
      <div className="scroll-card flex flex-col items-center gap-3 p-12 text-center">
        <AlertCircle className="h-6 w-6 text-konoha-akatsuki" />
        <p className="text-sm text-foreground">Scroll not found.</p>
        <Link
          href="/dashboard/analytics"
          className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-konoha-orange hover:text-konoha-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to analytics
        </Link>
      </div>
    );
  }

  const form = formQuery.data as {
    id: string;
    title: string;
    slug: string;
    status: string;
    fields: Array<{ id: string; type: string; label: string; order: number }>;
  };

  const summary = analyticsQuery.data as
    | {
        totalViews: number;
        uniqueViews: number;
        totalStarts: number;
        totalSubmissions: number;
        completionRate: number;
        avgCompletionTimeMs: number | null;
        topCountries: Array<{ country: string; count: number }>;
        topReferrers: Array<{ referrer: string; count: number }>;
        dailySubmissions: Array<{ date: string; count: number }>;
      }
    | undefined;

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-konoha-orange"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Analytics
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <CsvExport
            formId={form.id}
            formTitle={form.title}
            formSlug={form.slug}
            fields={form.fields ?? []}
          />
          <Link
            href={`/dashboard/forms/${form.id}`}
            className="flex h-9 items-center gap-2 rounded-md border border-konoha-forest/60 px-3 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit fields</span>
          </Link>
          {form.status === "published" && (
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 items-center gap-2 rounded-md border border-konoha-forest/60 px-3 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View live</span>
            </a>
          )}
        </div>
      </div>

      {/* Title + range filter */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
            Sharingan · 写輪眼
          </p>
          <h1 className="font-heading text-2xl font-black tracking-tight md:text-3xl">
            {form.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Insights into how shinobi engage with your scroll
          </p>
        </div>

        <div className="flex rounded-md border border-konoha-forest/40 bg-konoha-ink/40 p-1">
          {RANGES.map((r) => {
            const active = r.id === range;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`rounded px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? "bg-konoha-orange/15 text-konoha-orange"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI row */}
      <div className="mb-8">
        <KpiRow summary={summary} loading={analyticsQuery.isLoading} />
      </div>

      {/* Trend chart + funnel */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="scroll-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
                Daily Submissions
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Submissions over time
              </p>
            </div>
            <span className="font-heading text-2xl font-black text-konoha-orange tabular-nums">
              {summary?.totalSubmissions.toLocaleString() ?? 0}
            </span>
          </div>
          {analyticsQuery.isLoading ? (
            <div className="h-[220px] animate-pulse rounded-md bg-konoha-forest/20" />
          ) : (
            <DailyTrendChart data={summary?.dailySubmissions ?? []} />
          )}
        </div>

        <div className="scroll-card p-5">
          <div className="mb-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
              Conversion Funnel
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              How visitors flow through
            </p>
          </div>
          {analyticsQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-konoha-forest/20" />
              ))}
            </div>
          ) : (
            <Funnel
              views={summary?.totalViews ?? 0}
              starts={summary?.totalStarts ?? 0}
              submissions={summary?.totalSubmissions ?? 0}
            />
          )}
        </div>
      </div>

      {/* Geo + referrers */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="scroll-card p-5">
          <div className="mb-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
              Top Countries
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Where the chakra flows from
            </p>
          </div>
          <BarList
            items={(summary?.topCountries ?? []).map((c) => ({
              label: c.country,
              count: c.count,
            }))}
            emptyLabel="Geo data pending"
          />
        </div>

        <div className="scroll-card p-5">
          <div className="mb-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
              Top Referrers
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              How shinobi found this scroll
            </p>
          </div>
          <BarList
            items={(summary?.topReferrers ?? []).map((r) => ({
              label: r.referrer,
              count: r.count,
            }))}
            emptyLabel="No referrers tracked yet"
          />
        </div>
      </div>

      {/* Responses table */}
      <ResponsesTable formId={formId} fields={form.fields ?? []} />
    </div>
  );
}
