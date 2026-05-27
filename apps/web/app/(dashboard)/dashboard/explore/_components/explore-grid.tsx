"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Map, ScrollText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ExploreSearch } from "./explore-search";
import {
  ExploreCard,
  ExploreCardSkeleton,
  ExploreEmpty,
} from "./explore-card";

interface ExploreForm {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  publishedAt: string | Date | null;
  responseCount: number;
  owner?: { id: string; fullName: string | null; email: string } | null;
}

interface ExploreResponse {
  items: ExploreForm[];
  total: number;
}

const PAGE_SIZE = 12;

/**
 * Listing of public scrolls. Used by both the in-dashboard
 * /dashboard/explore and the unauthenticated /explore route.
 */
export function ExploreGrid() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = trpc.explore.listForms.useQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search.trim() || undefined,
  });

  const result = data as ExploreResponse | undefined;
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = result?.items ?? [];

  const isFiltering = search.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Search bar + meta */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ExploreSearch
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <Map className="h-3 w-3" />
          {isLoading ? (
            "Charting…"
          ) : (
            <>
              <span className="font-mono tabular-nums text-konoha-orange">
                {total}
              </span>
              {total === 1 ? "scroll" : "scrolls"}
              {isFiltering && " match your search"}
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ExploreCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ExploreEmpty
          message="Couldn't reach the Village Map"
          hint={(error?.message ?? "Unknown error").slice(0, 120)}
        />
      ) : items.length === 0 ? (
        isFiltering ? (
          <ExploreEmpty
            message="No scrolls match your search"
            hint="Try a different keyword, or clear the search to see every public scroll."
          />
        ) : (
          <ExploreEmpty
            message="The Village Map is empty"
            hint="When shinobi publish public scrolls, they'll appear here for the whole village to find."
          />
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((form) => (
            <ExploreCard key={form.id} form={form} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-9 items-center gap-1.5 rounded-md border border-konoha-forest/60 px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Page <span className="text-konoha-orange">{page}</span> of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex h-9 items-center gap-1.5 rounded-md border border-konoha-forest/60 px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Variant used as a "Try one of these" suggestions block on the dashboard.
 */
export function ExploreSuggestions({ limit = 3 }: { limit?: number }) {
  const { data, isLoading } = trpc.explore.listForms.useQuery({
    page: 1,
    pageSize: limit,
  });

  const result = data as ExploreResponse | undefined;
  const items = result?.items ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: limit }).map((_, i) => (
          <ExploreCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="scroll-card flex items-center gap-3 p-5 text-sm text-muted-foreground">
        <ScrollText className="h-4 w-4" />
        No public scrolls yet — be the first to share one.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((form) => (
        <ExploreCard key={form.id} form={form} />
      ))}
    </div>
  );
}
