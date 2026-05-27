"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Inbox } from "lucide-react";
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

const PAGE_SIZE = 10;

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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = trpc.forms.listResponses.useQuery({
    formId,
    page,
    pageSize: PAGE_SIZE,
  });

  const items = (data?.items ?? []) as ResponseRow[];
  const total = (data?.total ?? 0) as number;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Show first 3 fields as columns to keep the table compact
  const previewFields = fields
    .slice()
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);

  return (
    <>
      <div className="scroll-card overflow-hidden">
        <div className="border-b border-konoha-forest/40 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
            Recent Submissions
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {total} total · click any row to inspect
          </p>
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
            <p className="text-sm text-foreground">No responses yet.</p>
            <p className="max-w-sm text-[11px] leading-relaxed text-muted-foreground">
              Once shinobi submit your scroll, their answers will appear here.
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
                      <td className="px-3 py-3 align-top text-right">
                        <Eye className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-konoha-orange" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 border-t border-konoha-forest/40 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
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
            )}
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
