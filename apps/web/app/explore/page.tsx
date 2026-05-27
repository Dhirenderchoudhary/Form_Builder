import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Header } from "@/components/header";
import { KonohaLeaf } from "@/components/konoha/leaf";
import { ExploreGrid } from "@/app/(dashboard)/dashboard/explore/_components/explore-grid";

export const metadata: Metadata = {
  title: "Village Map — Konoha Forms",
  description:
    "Browse public mission scrolls forged across the Five Great Nations.",
};

export default function PublicExplorePage() {
  return (
    <div className="relative min-h-screen text-foreground">
      <Header />

      {/* Hero — matches the homepage aesthetic */}
      <section className="relative px-6 pt-32 pb-16 text-center md:pt-40 md:pb-20">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mx-auto mb-6 w-14 animate-chakra-pulse">
            <KonohaLeaf size={56} color="#FF6B00" glow />
          </div>

          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
            <Compass className="h-3 w-3" />
            Village Map · 探索
          </p>

          <h1 className="font-heading text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            Scrolls from across<br />
            <span className="bg-gradient-to-r from-konoha-orange via-konoha-gold to-konoha-orange bg-clip-text text-transparent text-glow-orange">
              the Five Nations.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Public mission scrolls forged by shinobi everywhere. Find
            inspiration, contribute responses, or build your own.
          </p>

          <div className="mx-auto mt-6 h-px w-32 chakra-divider" />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="btn-rasengan flex h-10 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-5 font-heading text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)]"
            >
              Forge your own scroll
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <ExploreGrid />
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-konoha-forest/40 bg-konoha-ink/60 px-6 py-8 backdrop-blur">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:flex-row">
          <div className="flex items-center gap-3">
            <KonohaLeaf size={20} color="#FF6B00" />
            <span className="font-heading font-bold tracking-[0.3em] text-konoha-orange">
              KONOHA · FORM SCROLLS
            </span>
          </div>
          <p>© {new Date().getFullYear()} Hidden Leaf Division</p>
        </div>
      </footer>
    </div>
  );
}
