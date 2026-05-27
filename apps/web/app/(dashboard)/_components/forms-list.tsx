"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ScrollText,
  ArrowRight,
  Search,
  Inbox,
  Plus,
  Palette,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/konoha/toast";
import { CreateFormDialog } from "./create-form-dialog";
import { DeleteFormDialog } from "./delete-form-dialog";
import { FormRowMenu } from "./form-row-menu";

interface FormRow {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: "draft" | "published" | "closed" | "archived";
  publishedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date | null;
  responseCount: number;
}

const statusStyles: Record<
  FormRow["status"],
  { label: string; cls: string }
> = {
  draft: {
    label: "Draft",
    cls: "bg-konoha-forest/30 text-muted-foreground border-konoha-forest",
  },
  published: {
    label: "Live",
    cls: "bg-konoha-orange/15 text-konoha-orange border-konoha-orange/40",
  },
  closed: {
    label: "Sealed",
    cls: "bg-konoha-akatsuki/15 text-konoha-akatsuki border-konoha-akatsuki/40",
  },
  archived: {
    label: "Archived",
    cls: "bg-konoha-forest/20 text-muted-foreground border-konoha-forest",
  },
};

type Tab = "active" | "sealed" | "all";

const tabs: { id: Tab; label: string }[] = [
  { id: "active", label: "Active Scrolls" },
  { id: "sealed", label: "Sealed" },
  { id: "all", label: "All" },
];

function formatRelative(d: string | Date | null): string {
  if (!d) return "—";
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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

interface FormsListProps {
  /** When true, the list shows full search/tabs/empty UI (used on /dashboard/forms). */
  full?: boolean;
}

export function FormsList({ full = false }: FormsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const utils = trpc.useUtils();

  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormRow | null>(null);

  // Auto-open the create dialog when ?new=1 or ?create=true is in the URL.
  // Strips the param after opening so back/forward doesn't re-trigger.
  useEffect(() => {
    if (searchParams.get("new") === "1" || searchParams.get("create") === "true") {
      setCreateOpen(true);
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  // Theme-apply mode: came from /dashboard/themes with ?theme=ID
  const themeIdToApply = searchParams.get("theme");

  // Look up the theme being applied so we can show its name
  const themesQuery = trpc.explore.listThemes.useQuery(undefined, {
    enabled: !!themeIdToApply,
  });
  const themeBeingApplied = themeIdToApply
    ? ((themesQuery.data ?? []) as Array<{
        id: string;
        name: string;
        colors: { primary: string; accent: string };
      }>).find((t) => t.id === themeIdToApply)
    : null;

  const applyTheme = trpc.forms.update.useMutation({
    onSuccess: async () => {
      await utils.forms.list.invalidate();
      toast.push({
        variant: "success",
        title: "Theme applied",
        message: `${themeBeingApplied?.name ?? "Theme"} now decorates the scroll.`,
      });
      router.replace(pathname, { scroll: false });
    },
    onError: (err) =>
      toast.push({
        variant: "error",
        title: "Could not apply theme",
        message: err.message?.slice(0, 120) ?? "",
      }),
  });

  const cancelThemeApply = () => {
    router.replace(pathname, { scroll: false });
  };

  const { data, isLoading, isError, error } = trpc.forms.list.useQuery();

  const filtered = useMemo(() => {
    let rows = (data ?? []) as FormRow[];
    if (tab === "active") rows = rows.filter((r) => r.status === "draft" || r.status === "published");
    else if (tab === "sealed") rows = rows.filter((r) => r.status === "closed");
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [data, tab, search]);

  if (isLoading) {
    return <FormsListSkeleton full={full} />;
  }

  if (isError) {
    return (
      <div className="scroll-card flex flex-col items-center gap-3 p-12 text-center">
        <p className="text-sm text-konoha-akatsuki">
          Couldn&apos;t reach the scroll archive.
        </p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {(error?.message ?? "Unknown error").slice(0, 80)}
        </p>
      </div>
    );
  }

  const allEmpty = (data ?? []).length === 0;

  // Compact view for the dashboard home — no tabs, no search, just rows.
  if (!full) {
    if (allEmpty) {
      return <EmptyState onCreate={() => setCreateOpen(true)} />;
    }

    const top = (data as FormRow[]).slice(0, 5);
    return (
      <>
        <div className="scroll-card overflow-hidden">
          <div className="divide-y divide-konoha-forest/40">
            {top.map((form) => (
              <FormRowItem
                key={form.id}
                form={form}
                onDelete={() => setDeleteTarget(form)}
                onEdit={() => router.push(`/dashboard/forms/${form.id}`)}
              />
            ))}
          </div>
          {(data as FormRow[]).length > 5 && (
            <Link
              href="/dashboard/forms"
              className="flex items-center justify-center gap-2 border-t border-konoha-forest/40 py-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-konoha-forest/15 hover:text-konoha-orange"
            >
              View all {(data as FormRow[]).length} scrolls
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <CreateFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
        <DeleteFormDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          formId={deleteTarget?.id ?? null}
          formTitle={deleteTarget?.title ?? ""}
        />
      </>
    );
  }

  // Full view (used on /dashboard/forms)
  return (
    <>
      {/* Theme-apply banner */}
      {themeIdToApply && (
        <ThemeApplyBanner
          themeName={themeBeingApplied?.name ?? "Theme"}
          themeColors={themeBeingApplied?.colors}
          onCancel={cancelThemeApply}
          loading={applyTheme.isPending}
        />
      )}

      {/* Tabs + create */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-md border border-konoha-forest/40 bg-konoha-ink/40 p-1">
          {tabs.map((t) => {
            const active = t.id === tab;
            const count =
              t.id === "active"
                ? (data as FormRow[]).filter(
                    (r) => r.status === "draft" || r.status === "published",
                  ).length
                : t.id === "sealed"
                  ? (data as FormRow[]).filter((r) => r.status === "closed").length
                  : (data as FormRow[]).length;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? "bg-konoha-orange/15 text-konoha-orange"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 text-[9px] tabular-nums ${
                    active
                      ? "bg-konoha-orange/25 text-konoha-orange"
                      : "bg-konoha-forest/40 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative ml-auto w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search scrolls…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 pl-9 pr-3 text-xs uppercase tracking-[0.15em] text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
          />
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="btn-rasengan flex h-9 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-4 font-heading text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Forge scroll
        </button>
      </div>

      {/* Body */}
      {allEmpty ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : filtered.length === 0 ? (
        <NoMatches onClear={() => setSearch("")} />
      ) : (
        <div className="scroll-card overflow-hidden">
          <div className="divide-y divide-konoha-forest/40">
            {filtered.map((form) => (
              <FormRowItem
                key={form.id}
                form={form}
                themeMode={!!themeIdToApply}
                onApplyTheme={
                  themeIdToApply
                    ? () =>
                        applyTheme.mutate({
                          formId: form.id,
                          themeId: themeIdToApply,
                        })
                    : undefined
                }
                onDelete={() => setDeleteTarget(form)}
                onEdit={() => router.push(`/dashboard/forms/${form.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <CreateFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <DeleteFormDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        formId={deleteTarget?.id ?? null}
        formTitle={deleteTarget?.title ?? ""}
      />
    </>
  );
}

function FormRowItem({
  form,
  onDelete,
  onEdit,
  onApplyTheme,
  themeMode,
}: {
  form: FormRow;
  onDelete: () => void;
  onEdit: () => void;
  onApplyTheme?: () => void;
  themeMode?: boolean;
}) {
  const status = statusStyles[form.status];

  const Inner = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-konoha-forest bg-konoha-ink text-muted-foreground group-hover:border-konoha-orange/60 group-hover:text-konoha-orange">
        <ScrollText className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-heading font-bold tracking-wide text-foreground group-hover:text-konoha-orange">
            {form.title}
          </h3>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.2em] ${status.cls}`}
          >
            {status.label}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {form.description || (
            <span className="italic opacity-60">No description set</span>
          )}
        </p>
      </div>

      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
        <Inbox className="h-3.5 w-3.5" />
        <span className="tabular-nums text-foreground">
          {form.responseCount}
        </span>
      </div>

      <div className="hidden text-right md:block">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Updated
        </p>
        <p className="mt-0.5 text-xs text-foreground">
          {formatRelative(form.updatedAt ?? form.createdAt)}
        </p>
      </div>
    </>
  );

  return (
    <div
      className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-konoha-forest/15 ${
        themeMode ? "cursor-pointer" : ""
      }`}
    >
      {themeMode && onApplyTheme ? (
        <button
          type="button"
          onClick={onApplyTheme}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          {Inner}
          <span className="ml-2 hidden shrink-0 rounded-md border border-konoha-orange/40 bg-konoha-orange/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-konoha-orange md:inline">
            Apply theme
          </span>
        </button>
      ) : (
        <Link
          href={`/dashboard/forms/${form.id}`}
          className="flex min-w-0 flex-1 items-center gap-4"
        >
          {Inner}
        </Link>
      )}

      {!themeMode && (
        <FormRowMenu
          formId={form.id}
          formSlug={form.slug}
          status={form.status}
          onRequestDelete={onDelete}
          onEdit={onEdit}
        />
      )}
    </div>
  );
}

function FormsListSkeleton({ full }: { full: boolean }) {
  return (
    <>
      {full && (
        <div className="mb-4 flex items-center gap-3">
          <div className="h-9 w-72 animate-pulse rounded-md bg-konoha-forest/30" />
          <div className="h-9 w-72 animate-pulse rounded-md bg-konoha-forest/30 ml-auto" />
        </div>
      )}
      <div className="scroll-card divide-y divide-konoha-forest/40 overflow-hidden">
        {Array.from({ length: full ? 6 : 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-konoha-forest/40" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 animate-pulse rounded bg-konoha-forest/40" />
              <div className="h-2.5 w-1/2 animate-pulse rounded bg-konoha-forest/30" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="scroll-card flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-konoha-orange/40 bg-konoha-ink text-konoha-orange">
        <ScrollText className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-heading text-lg font-bold tracking-wide">
          No scrolls forged yet
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Your archive is empty. Choose a destination, sketch the mission, and
          send your first scroll across the village.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="btn-rasengan mt-2 inline-flex h-10 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-5 font-heading text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)]"
      >
        Forge your first scroll
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="scroll-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <Search className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-foreground">
        No scrolls match your search.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-[11px] uppercase tracking-[0.2em] text-konoha-orange hover:text-konoha-gold"
      >
        Clear search
      </button>
    </div>
  );
}

function ThemeApplyBanner({
  themeName,
  themeColors,
  onCancel,
  loading,
}: {
  themeName: string;
  themeColors?: { primary: string; accent: string };
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-konoha-orange/40 bg-konoha-orange/5 p-3 md:p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-konoha-orange/40 bg-konoha-orange/10 text-konoha-orange">
        <Palette className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
            Apply theme
          </p>
          {themeColors && (
            <div className="flex items-center gap-1">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: themeColors.primary,
                  boxShadow: `0 0 6px ${themeColors.primary}80`,
                }}
              />
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: themeColors.accent,
                  boxShadow: `0 0 6px ${themeColors.accent}80`,
                }}
              />
            </div>
          )}
        </div>
        <p className="mt-0.5 text-xs text-foreground">
          Pick a scroll to apply{" "}
          <span className="font-semibold text-konoha-orange">{themeName}</span> to.
          {loading && <span className="ml-1.5 text-muted-foreground">Sealing…</span>}
        </p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="flex h-8 items-center gap-1.5 rounded-md border border-konoha-forest/60 px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange disabled:opacity-40"
      >
        <X className="h-3 w-3" />
        Cancel
      </button>
    </div>
  );
}
