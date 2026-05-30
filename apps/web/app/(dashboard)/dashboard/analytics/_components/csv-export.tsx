"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/konoha/toast";

interface Field {
  id: string;
  label: string;
  order: number;
}

interface Props {
  formId: string;
  formTitle: string;
  formSlug: string;
  fields: Field[];
}

interface ResponseRow {
  id: string;
  submittedAt: string | Date;
  respondentEmail: string | null;
  ipAddress: string | null;
  completionTimeMs: number | null;
  answers: Array<{ fieldId: string; value: unknown }>;
}

const PAGE_SIZE = 100;

/**
 * Escape a value for CSV cells per RFC 4180:
 * - Wrap in double quotes if it contains comma, quote, or newline
 * - Escape inner quotes by doubling them
 */
function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s: string;
  if (Array.isArray(v)) s = v.join("; ");
  else if (typeof v === "boolean") s = v ? "Yes" : "No";
  else s = String(v);

  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function fileNameFor(slug: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${slug}-responses-${date}.csv`;
}

export function CsvExport({ formId, formTitle, formSlug, fields }: Props) {
  const toast = useToast();
  const utils = trpc.useUtils();
  const [downloading, setDownloading] = useState(false);

  const sortedFields = fields.slice().sort((a, b) => a.order - b.order);

  async function fetchAll(): Promise<ResponseRow[]> {
    // Fetch the first page to discover the total count
    const first = (await utils.responses.list.fetch({
      formId,
      page: 1,
      pageSize: PAGE_SIZE,
    })) as { items: ResponseRow[]; total: number } | undefined;

    if (!first || first.items.length === 0) return [];

    const totalPages = Math.min(
      Math.ceil(first.total / PAGE_SIZE),
      200, // Safety cap
    );

    if (totalPages <= 1) return first.items;

    // Fetch all remaining pages concurrently
    const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    const rest = await Promise.all(
      pageNumbers.map((page) =>
        utils.responses.list.fetch({ formId, page, pageSize: PAGE_SIZE }),
      ),
    );

    return [
      ...first.items,
      ...rest.flatMap(
        (r: any) =>
          ((r as { items: ResponseRow[] } | undefined)?.items ?? []),
      ),
    ];
  }

  async function handleExport() {
    setDownloading(true);
    try {
      const rows = await fetchAll();
      if (rows.length === 0) {
        toast.push({
          variant: "error",
          title: "Nothing to export",
          message: "This scroll has no submissions yet.",
        });
        return;
      }

      // Header
      const header = [
        "submitted_at",
        "respondent_email",
        "ip_address",
        "completion_time_seconds",
        ...sortedFields.map((f) => f.label),
      ]
        .map(csvEscape)
        .join(",");

      const body = rows.map((r) => {
        const map = new Map(r.answers.map((a) => [a.fieldId, a.value]));
        const seconds = r.completionTimeMs ? Math.round(r.completionTimeMs / 1000) : "";
        const submittedAt =
          typeof r.submittedAt === "string"
            ? r.submittedAt
            : r.submittedAt.toISOString();

        return [
          submittedAt,
          r.respondentEmail ?? "",
          r.ipAddress ?? "",
          seconds,
          ...sortedFields.map((f) => map.get(f.id)),
        ]
          .map(csvEscape)
          .join(",");
      });

      // BOM so Excel reads UTF-8 correctly
      const csv = "\uFEFF" + [header, ...body].join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileNameFor(formSlug);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.push({
        variant: "success",
        title: "Scroll exported",
        message: `${rows.length} ${rows.length === 1 ? "response" : "responses"} archived.`,
      });
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Export failed",
        message:
          err instanceof Error ? err.message.slice(0, 120) : "Try again.",
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={downloading}
      title={`Export "${formTitle}" responses to CSV`}
      className="flex h-9 items-center gap-2 rounded-md border border-konoha-forest/60 px-3 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange disabled:cursor-not-allowed disabled:opacity-50"
    >
      {downloading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">
        {downloading ? "Exporting…" : "Export CSV"}
      </span>
    </button>
  );
}
