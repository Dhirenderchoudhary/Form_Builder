"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Inbox, ScrollText, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ItachiSilhouette } from "@/components/konoha/characters";

interface FormRow {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: "draft" | "published" | "closed" | "archived";
  publishedAt: string | Date | null;
  responseCount: number;
}

export default function AnalyticsIndexPage() {
  const { data, isLoading } = trpc.forms.list.useQuery();
  const forms = (data ?? []) as FormRow[];

  // Total responses across all forms
  const totalResponses = forms.reduce((acc, f) => acc + f.responseCount, 0);
  const liveCount = forms.filter((f) => f.status === "published").length;

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-lg border border-konoha-forest/40 bg-gradient-to-br from-konoha-ink/80 via-konoha-ink/60 to-transparent p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-4 hidden opacity-[0.18] md:block lg:-right-2 lg:opacity-[0.22]"
        >
          <ItachiSilhouette size={300} />
        </div>

        <div className="relative max-w-2xl">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
            Insight · 写輪眼
          </p>
          <h1 className="font-heading text-3xl font-black leading-tight md:text-5xl">
            Sharingan
            <span className="block text-konoha-orange text-glow-orange">Analytics.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            See every drop-off, every hesitation, every completion across your
            scrolls. Pick a scroll below to dive deep.
          </p>
        </div>
      </section>

      {/* Roll-up stats */}
      <section className="mb-10">
        <h2 className="mb-4 font-heading text-base font-bold uppercase tracking-[0.2em]">
          Across all scrolls
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <RollupCard
            label="Total scrolls"
            value={forms.length}
            icon={ScrollText}
            loading={isLoading}
          />
          <RollupCard
            label="Live scrolls"
            value={liveCount}
            icon={TrendingUp}
            loading={isLoading}
          />
          <RollupCard
            label="Responses collected"
            value={totalResponses}
            icon={Inbox}
            loading={isLoading}
          />
        </div>
      </section>

      {/* Form picker */}
      <section>
        <h2 className="mb-4 font-heading text-base font-bold uppercase tracking-[0.2em]">
          Pick a scroll to inspect
        </h2>

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-md bg-konoha-forest/20" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="scroll-card flex flex-col items-center gap-3 p-12 text-center">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-foreground">
              You haven&apos;t forged any scrolls yet.
            </p>
            <p className="max-w-sm text-[11px] leading-relaxed text-muted-foreground">
              Create a scroll first, deploy it, then return here to watch the
              chakra flow.
            </p>
            <Link
              href="/dashboard/forms?new=1"
              className="btn-rasengan mt-2 inline-flex h-9 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-4 font-heading text-[11px] uppercase tracking-[0.18em] text-white"
            >
              Forge first scroll
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {forms.map((form) => (
              <Link
                key={form.id}
                href={`/dashboard/analytics/${form.id}`}
                className="scroll-card group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-konoha-orange/60 hover:shadow-[0_0_24px_rgba(255,107,0,0.12)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-konoha-forest bg-konoha-ink text-muted-foreground group-hover:border-konoha-orange/60 group-hover:text-konoha-orange">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading font-bold tracking-wide text-foreground group-hover:text-konoha-orange">
                    {form.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Inbox className="h-3 w-3" />
                      <span className="tabular-nums text-foreground">
                        {form.responseCount}
                      </span>{" "}
                      responses
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
                        form.status === "published"
                          ? "border-konoha-orange/40 text-konoha-orange"
                          : "border-konoha-forest text-muted-foreground"
                      }`}
                    >
                      {form.status}
                    </span>
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-konoha-orange" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RollupCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: typeof BarChart3;
  loading?: boolean;
}) {
  return (
    <div className="scroll-card flex items-center gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-konoha-orange/40 bg-konoha-orange/10 text-konoha-orange">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </p>
        {loading ? (
          <div className="mt-1.5 h-7 w-16 animate-pulse rounded bg-konoha-forest/40" />
        ) : (
          <p className="font-heading text-2xl font-black tabular-nums text-konoha-orange">
            {value.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
