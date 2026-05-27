"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Compass } from "lucide-react";
import { ItachiSilhouette } from "@/components/konoha/characters";
import { ExploreGrid } from "./_components/explore-grid";

export default function ExplorePage() {
  return (
    <div>
      {/* Hero band */}
      <section className="relative mb-10 overflow-hidden rounded-lg border border-konoha-forest/40 bg-gradient-to-br from-konoha-ink/80 via-konoha-ink/60 to-transparent p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-4 hidden opacity-[0.18] md:block lg:-right-2 lg:opacity-[0.22]"
        >
          <ItachiSilhouette size={300} />
        </div>

        <div className="relative max-w-2xl">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
            <Compass className="h-3 w-3" />
            Village Map · 探索
          </p>
          <h1 className="font-heading text-3xl font-black leading-tight md:text-5xl">
            Discover scrolls<br />
            <span className="text-konoha-orange text-glow-orange">
              forged across the
            </span>{" "}
            Five Nations.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Public mission scrolls from shinobi everywhere. Browse, learn from,
            or fork ideas into your own work.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/explore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-2 rounded-md border border-konoha-orange/40 bg-konoha-orange/5 px-3 text-[11px] uppercase tracking-[0.18em] text-konoha-orange hover:bg-konoha-orange/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open public map
            </Link>
            <Link
              href="/dashboard/forms?new=1"
              className="btn-rasengan flex h-9 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-4 font-heading text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)]"
            >
              Forge your own scroll
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <ExploreGrid />
    </div>
  );
}
