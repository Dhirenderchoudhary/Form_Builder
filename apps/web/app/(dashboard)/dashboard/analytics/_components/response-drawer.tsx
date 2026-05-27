"use client";

import { useEffect } from "react";
import { X, Trash2, Mail, Globe, Timer, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/konoha/toast";

interface Field {
  id: string;
  type: string;
  label: string;
  order: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  formId: string;
  responseId: string | null;
  fields: Field[];
}

function formatDateTime(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  return `${min}m ${sec % 60}s`;
}

function renderValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="italic text-muted-foreground/60">No answer</span>;
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v, i) => (
          <span
            key={i}
            className="rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-2 py-0.5 text-[11px]"
          >
            {String(v)}
          </span>
        ))}
      </div>
    );
  }
  if (typeof value === "boolean") {
    return value ? (
      <span className="text-konoha-orange">Yes</span>
    ) : (
      <span className="text-muted-foreground">No</span>
    );
  }
  return <span className="break-words">{String(value)}</span>;
}

export function ResponseDrawer({ open, onClose, formId, responseId, fields }: Props) {
  const toast = useToast();
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.forms.getResponse.useQuery(
    { formId, responseId: responseId ?? "" },
    { enabled: !!responseId },
  );

  const response = data as
    | {
        id: string;
        submittedAt: string;
        respondentEmail: string | null;
        ipAddress: string | null;
        completionTimeMs: number | null;
        answers: Array<{ fieldId: string; value: unknown }>;
      }
    | undefined;

  const deleteResponse = trpc.forms.deleteResponse.useMutation({
    onSuccess: async () => {
      await utils.forms.listResponses.invalidate({ formId });
      await utils.forms.analytics.invalidate({ formId });
      toast.push({
        variant: "success",
        title: "Response purged",
        message: "It's gone from the village vault.",
      });
      onClose();
    },
    onError: (err) =>
      toast.push({
        variant: "error",
        title: "Could not delete",
        message: err.message?.slice(0, 120) ?? "Try again.",
      }),
  });

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sortedFields = fields.slice().sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal>
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close drawer"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      />

      {/* Panel */}
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-konoha-forest/40 bg-konoha-ink/95 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-[slideInRight_0.3s_cubic-bezier(0.4,0,0.2,1)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-konoha-forest/40 px-6 py-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
              Submission · 提出
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold tracking-tight">
              Response details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-konoha-forest/30 hover:text-konoha-orange"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading || !response ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-1/4 animate-pulse rounded bg-konoha-forest/40" />
                  <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-konoha-forest/30" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Meta block */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <Meta icon={Calendar} label="Submitted" value={formatDateTime(response.submittedAt)} />
                <Meta icon={Timer} label="Time spent" value={formatDuration(response.completionTimeMs)} />
                <Meta
                  icon={Mail}
                  label="Email"
                  value={response.respondentEmail ?? "—"}
                />
                <Meta
                  icon={Globe}
                  label="IP"
                  value={response.ipAddress ?? "—"}
                  mono
                />
              </div>

              {/* Answers */}
              <div className="space-y-5">
                {sortedFields.map((field) => {
                  const ans = response.answers.find((a) => a.fieldId === field.id);
                  return (
                    <div
                      key={field.id}
                      className="rounded-md border border-konoha-forest/40 bg-konoha-ink/60 p-4"
                    >
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                        {field.label}
                      </p>
                      <div className="text-sm leading-relaxed text-foreground">
                        {renderValue(ans?.value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {response && (
          <div className="border-t border-konoha-forest/40 px-6 py-4">
            <button
              type="button"
              onClick={() => {
                if (confirm("Purge this response from the village vault? This cannot be undone.")) {
                  deleteResponse.mutate({ formId, responseId: response.id });
                }
              }}
              disabled={deleteResponse.isPending}
              className="flex h-10 items-center gap-2 rounded-md border border-konoha-akatsuki/60 px-4 text-xs uppercase tracking-[0.2em] text-konoha-akatsuki hover:bg-konoha-akatsuki/10 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleteResponse.isPending ? "Purging…" : "Purge response"}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border border-konoha-forest/40 bg-konoha-ink/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p
        className={`mt-1 truncate text-xs text-foreground ${
          mono ? "font-mono" : ""
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
