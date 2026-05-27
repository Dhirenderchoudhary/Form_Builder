"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Inbox, Search, X, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ResponseDrawer } from "./response-drawer";

interface Field {
  id: string;
  type: string;
  label: string;
  order: number;
}

interface Props {
  formId: string;
  fields: Field[];
}

interface ResponseRow {
  id: string;
  submittedAt: string | Date;
  respondentEmail: string | null;
  ipAddress: string | null;
  completionTimeMs: number | null;
  answers: Array<{
    fieldId: string;
    value: unknown;
  }>;
}

const PAGE_SIZES = [10, 25, 50] as const;

function formatRelative(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function previewValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

export function ResponsesTable({ formId, fields }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [emailFilter, setEmailFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasFilters = emailFilter || dateFrom || dateTo;

  const { data, isLoading } = trpc.forms.listResponses.useQuery({
    formId,
    page,
    pageSize,
    ...(dateFrom ? { from: new Date(dateFrom).toISOString() } : {}),
    ...(dateTo ? { to: new Date(dateTo + "T23:59:59").toISOString() } : {}),
  });

  const allItems = (data?.items ?? []) as ResponseRow[];
  // Client-side email filter (since the API may not support it natively)
  const items = emailFilter
    ? allItems.filter((r) =>
        r.respondentEmail?.toLowerCase().includes(emailFilter.toLowerCase())
      )
    : allItems;
  const total = (data?.total ?? 0) as number;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Show first 3 fields as columns to keep the table compact
  const previewFields = fields
    .slice()
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  const clearFilters = () => {
    setEmailFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // Generate page numbers to show
  const pageNumbers: number[] = [];
  const maxButtons = 5;
  let startP = Math.max(1, page - Math.floor(maxButtons / 2));
  const endP = Math.min(totalPages, startP + maxButtons - 1);
  startP = Math.max(1, endP - maxButtons + 1);
  for (let i = startP; i <= endP; i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div className="scroll-card overflow-hidden">
        <div className="border-b border-konoha-forest/40 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
                Submissions
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {total} total · click any row to inspect
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex h-8 items-center gap-1.5 rounded-md border px-3 text-[10px] uppercase tracking-[0.18em] transition-colors ${
                filtersOpen || hasFilters
                  ? "border-konoha-orange/40 bg-konoha-orange/10 text-konoha-orange"
                  : "border-konoha-forest/60 text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
              }`}
            >
              <Search className="h-3 w-3" />
              Filters
              {hasFilters && (
                <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-konoha-orange text-[8px] text-white">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Filter controls */}
          {filtersOpen && (
            <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-konoha-forest/40 pt-3">
              {/* Email search */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Email
                </span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={emailFilter}
                    onChange={(e) => {
                      setEmailFilter(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search email..."
                    className="h-8 w-48 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
                  />
                </div>
              </div>

              {/* Date from */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  From
                </span>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 w-40 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 pl-8 pr-2 text-xs text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
                  />
                </div>
              </div>

              {/* Date to */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  To
                </span>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 w-40 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 pl-8 pr-2 text-xs text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
                  />
                </div>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex h-8 items-center gap-1 rounded-md border border-konoha-akatsuki/40 px-2.5 text-[10px] uppercase tracking-[0.15em] text-konoha-akatsuki hover:bg-konoha-akatsuki/10"
                >
                  <X className="h-3 w-3" />
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="divide-y divide-konoha-forest/40">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-3 w-1/4 animate-pulse rounded bg-konoha-forest/40" />
                <div className="h-3 flex-1 animate-pulse rounded bg-konoha-forest/30" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Inbox className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-foreground">
              {hasFilters ? "No matching responses." : "No responses yet."}
            </p>
            <p className="max-w-sm text-[11px] leading-relaxed text-muted-foreground">
              {hasFilters
                ? "Try adjusting your filters."
                : "Once shinobi submit your scroll, their answers will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-konoha-ink/40">
                  <tr className="text-left">
                    <th className="px-4 py-2.5 text-[9px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                      Submitted
                    </th>
                    {previewFields.map((f) => (
                      <th
                        key={f.id}
                        className="px-4 py-2.5 text-[9px] font-medium uppercase tracking-[0.25em] text-muted-foreground"
                      >
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-2.5" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-konoha-forest/40">
                  {items.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      className="group cursor-pointer transition-colors hover:bg-konoha-forest/10"
                    >
                      <td className="px-4 py-3 align-top">
                        <p className="text-xs text-foreground">
                          {formatRelative(r.submittedAt)}
                        </p>
                        {r.respondentEmail && (
                          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                            {r.respondentEmail}
                          </p>
                        )}
                      </td>
                      {previewFields.map((f) => {
                        const ans = r.answers.find((a) => a.fieldId === f.id);
                        return (
                          <td
                            key={f.id}
                            className="px-4 py-3 align-top text-xs text-muted-foreground"
                          >
                            <span className="line-clamp-2">
                              {previewValue(ans?.value)}
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-3 align-top text-right">
                        <Eye className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-konoha-orange" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-konoha-forest/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-7 rounded border border-konoha-forest/60 bg-konoha-ink/60 px-1.5 text-[10px] text-foreground focus:border-konoha-orange focus:outline-none"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s} / page
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-konoha-forest/60 text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-xs transition-colors ${
                      p === page
                        ? "border border-konoha-orange/40 bg-konoha-orange/15 text-konoha-orange"
                        : "text-muted-foreground hover:bg-konoha-forest/20 hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-konoha-forest/60 text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ResponseDrawer
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        formId={formId}
        responseId={selectedId}
        fields={fields}
      />
    </>
  );
}
