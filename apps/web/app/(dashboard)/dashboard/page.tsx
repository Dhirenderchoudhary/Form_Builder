"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ScrollText, Inbox, Radio, TrendingUp, Compass, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ItachiSilhouette } from "@/components/konoha/characters";
import { StatCard } from "../_components/stat-card";
import { FormsList } from "../_components/forms-list";
import { ExploreSuggestions } from "./explore/_components/explore-grid";

interface FormRow {
  id: string;
  status: "draft" | "published" | "closed" | "archived";
  responseCount: number;
}

export default function DashboardHomePage() {
  const { data: me } = trpc.auth.getMe.useQuery();
  const { data: forms, isLoading, isError } = trpc.forms.list.useQuery();

  const formsArr = (forms ?? []) as FormRow[];
  const total = formsArr.length;
  const published = formsArr.filter((f) => f.status === "published").length;
  const drafts = formsArr.filter((f) => f.status === "draft").length;
  const totalResponses = formsArr.reduce((acc, f) => acc + (f.responseCount ?? 0), 0);
  const livePercent = total > 0 ? Math.round((published / total) * 100) : 0;

  // Greeting by time of day — small humanizing touch
  const hour = new Date().getHours();
  const greeting =
    hour < 5
      ? "The night is long"
      : hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : hour < 21
            ? "The sun sets over Konoha"
            : "Good evening";

  const firstName = me?.fullName?.split(" ")[0] ?? "shinobi";

  return (
    <div className="relative">
      {/* Hero band */}
      <section className="relative mb-10 overflow-hidden rounded-lg border border-konoha-forest/40 bg-gradient-to-br from-konoha-ink/80 via-konoha-ink/60 to-transparent p-6 md:p-10">
        {/* Itachi silhouette right side, very subtle */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-4 hidden md:block lg:-right-2"
        >
          <ItachiSilhouette size={300} />
        </div>

        <div className="relative max-w-2xl">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
            {greeting}
          </p>
          <h1 className="font-heading text-3xl font-black leading-tight md:text-5xl">
            {"Hokage's Desk "} <br/>
            <span className="text-konoha-orange text-glow-orange">
              {firstName}.
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Review your active scrolls, track responses across the Five Nations,
            and dispatch new missions when the village needs them.
          </p>

          <blockquote className="mt-6 border-l-2 border-konoha-orange/60 pl-4">
            <p className="text-sm italic text-muted-foreground">
              &ldquo;Those who break the rules are scum, but those who abandon
              their comrades are worse than scum.&rdquo;
            </p>
            <footer className="mt-2 text-[10px] uppercase tracking-[0.3em] text-konoha-orange/80">
              — Kakashi Hatake
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Stat cards */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-base font-bold uppercase tracking-[0.2em] text-foreground">
            Mission Overview
          </h2>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Updated live
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Scrolls"
            value={isError ? "-" : total}
            icon={ScrollText}
            hint="Active mission scrolls forged"
            loading={isLoading && !isError}
            accent="orange"
          />
          <StatCard
            label="Responses Collected"
            value={isError ? "-" : totalResponses}
            icon={Inbox}
            hint="Intel gathered from the field"
            loading={isLoading && !isError}
            accent="chakra"
          />
          <StatCard
            label="Live Scrolls"
            value={isError ? "-" : published}
            icon={Radio}
            hint={drafts > 0 ? `${drafts} still in draft` : "All deployed"}
            loading={isLoading && !isError}
            accent="gold"
          />
          <StatCard
            label="Deployment Rate"
            value={isError ? "-" : `${livePercent}%`}
            icon={TrendingUp}
            hint="Scrolls active in the field"
            loading={isLoading && !isError}
            accent="crimson"
          />
        </div>
      </section>

      {/* Forms list */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-base font-bold uppercase tracking-[0.2em] text-foreground">
              Active Scrolls
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Mission scrolls currently in your archive
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex h-32 items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground animate-pulse border border-konoha-forest/30 bg-konoha-ink/40 rounded-lg">
              Unrolling Active Mission Scrolls…
            </div>
          }
        >
          <FormsList />
        </Suspense>
      </section>

      {/* Explore suggestions */}
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-base font-bold uppercase tracking-[0.2em] text-foreground">
              <Compass className="h-3.5 w-3.5 text-konoha-orange" />
              From across the Village
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Public scrolls forged by other shinobi
            </p>
          </div>
          <Link
            href="/dashboard/explore"
            className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-konoha-orange hover:text-konoha-gold sm:flex"
          >
            Open the map
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <ExploreSuggestions limit={3} />
      </section>
    </div>
  );
}
