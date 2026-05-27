"use client";

import Link from "next/link";
import {
  Palette,
  Check,
  Sparkles,
  ArrowRight,
  TerminalSquare,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { NarutoSilhouette } from "@/components/konoha/characters";
import { ThemePreview } from "./_components/theme-preview";

interface DBTheme {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  isDefault: boolean | null;
  isActive: boolean | null;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    border: string;
    error: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
}

export default function ThemeGalleryPage() {
  const { data, isLoading, isError, error } = trpc.explore.listThemes.useQuery();

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-lg border border-konoha-forest/40 bg-gradient-to-br from-konoha-ink/80 via-konoha-ink/60 to-transparent p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-4 hidden opacity-[0.15] md:block lg:-right-2 lg:opacity-[0.2]"
        >
          <NarutoSilhouette size={300} />
        </div>

        <div className="relative max-w-2xl">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
            Themes · 装飾
          </p>
          <h1 className="font-heading text-3xl font-black leading-tight md:text-5xl">
            Theme
            <span className="block text-konoha-orange text-glow-orange">Gallery.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Reskin your scrolls with curated visual worlds. Each theme is a
            complete sensory experience — colors, fonts, the works.
          </p>
        </div>
      </section>

      {/* Empty / loading / error / data */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-md bg-konoha-forest/20"
            />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message={error?.message ?? "Couldn't reach the gallery."} />
      ) : !data || (data as DBTheme[]).length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-konoha-orange" />
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              {(data as DBTheme[]).length} theme
              {(data as DBTheme[]).length === 1 ? "" : "s"} available
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(data as DBTheme[]).map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ThemeCard({ theme }: { theme: DBTheme }) {
  return (
    <article className="scroll-card group flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-konoha-orange/60 hover:shadow-[0_0_30px_rgba(255,107,0,0.12)]">
      {/* Tag row */}
      <div className="flex items-center justify-between gap-2 border-b border-konoha-forest/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {theme.isDefault && (
            <span className="rounded-full border border-konoha-gold/40 bg-konoha-gold/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.25em] text-konoha-gold">
              Default
            </span>
          )}
          {theme.category && (
            <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              {theme.category}
            </span>
          )}
        </div>
        <span className="font-mono text-[9px] text-muted-foreground/60">
          /{theme.slug}
        </span>
      </div>

      {/* Live preview */}
      <div className="p-4">
        <ThemePreview colors={theme.colors} fonts={theme.fonts} />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
        <h3 className="font-heading text-lg font-bold tracking-wide">
          {theme.name}
        </h3>
        {theme.description && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {theme.description}
          </p>
        )}

        {/* Font specimen */}
        <div className="mt-auto rounded-md border border-konoha-forest/40 bg-konoha-ink/40 p-3">
          <div className="flex items-baseline justify-between gap-2 text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
            <span>Heading</span>
            <span className="font-mono text-muted-foreground/60">
              {theme.fonts.heading}
            </span>
          </div>
          <p
            className="mt-1 text-base font-bold tracking-wide text-foreground"
            style={{ fontFamily: theme.fonts.heading }}
          >
            The shinobi&apos;s path
          </p>

          <div className="mt-3 flex items-baseline justify-between gap-2 text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
            <span>Body</span>
            <span className="font-mono text-muted-foreground/60">
              {theme.fonts.body}
            </span>
          </div>
          <p
            className="mt-1 text-xs leading-relaxed text-muted-foreground"
            style={{ fontFamily: theme.fonts.body }}
          >
            The Will of Fire flows through every scroll forged in Konoha.
          </p>
        </div>

        {/* Apply CTA */}
        <Link
          href={`/dashboard/forms?theme=${theme.id}`}
          className="mt-2 flex h-10 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-5 font-heading text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.25)] transition-shadow hover:shadow-[0_0_30px_rgba(255,107,0,0.5)]"
        >
          <Check className="h-3.5 w-3.5" />
          Apply to a scroll
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="scroll-card flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-konoha-orange/40 bg-konoha-ink text-konoha-orange">
        <Palette className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-heading text-lg font-bold tracking-wide">
          The gallery is empty
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Themes haven&apos;t been seeded yet. Run the seeder once to populate
          the gallery with the built-in worlds.
        </p>
      </div>

      <div className="mx-auto mt-2 inline-flex items-center gap-2 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2 font-mono text-xs text-konoha-orange">
        <TerminalSquare className="h-3.5 w-3.5" />
        pnpm --filter @repo/database db:seed
      </div>

      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
        Run that once, then refresh this page.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="scroll-card flex flex-col items-center gap-3 p-12 text-center">
      <p className="text-sm text-konoha-akatsuki">
        Couldn&apos;t reach the theme gallery.
      </p>
      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {message.slice(0, 100)}
      </p>
    </div>
  );
}
