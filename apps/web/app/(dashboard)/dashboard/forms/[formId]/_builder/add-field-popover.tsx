"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";
import { FIELD_CATALOG, GROUP_LABELS } from "./field-catalog";
import type { FieldType } from "./types";

interface Props {
  onAdd: (type: FieldType) => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  label?: string;
}

/**
 * Popover button for inserting a new field from the catalog.
 * Closes on outside click and Escape.
 */
export function AddFieldPopover({
  onAdd,
  disabled,
  variant = "primary",
  label = "Add a field",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = query
    ? FIELD_CATALOG.filter((f) =>
        f.label.toLowerCase().includes(query.toLowerCase()),
      )
    : FIELD_CATALOG;

  const grouped: Record<string, typeof FIELD_CATALOG> = {};
  for (const f of filtered) {
    grouped[f.group] ??= [];
    grouped[f.group]!.push(f);
  }

  const handleSelect = (type: FieldType) => {
    setOpen(false);
    setQuery("");
    onAdd(type);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((s) => !s)}
        className={
          variant === "primary"
            ? "btn-rasengan flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-konoha-orange/50 bg-konoha-orange/5 px-4 font-heading text-[11px] uppercase tracking-[0.18em] text-konoha-orange hover:border-konoha-orange hover:bg-konoha-orange/10 disabled:opacity-50"
            : "flex h-9 items-center gap-2 rounded-md border border-konoha-forest/60 px-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange disabled:opacity-50"
        }
      >
        <Plus className="h-3.5 w-3.5" />
        {label}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-md border border-konoha-forest/60 bg-konoha-ink/95 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md animate-[menuIn_0.15s_ease]"
        >
          <div className="flex items-center gap-2 border-b border-konoha-forest/40 px-3 py-2.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              placeholder="Search field types…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs uppercase tracking-[0.15em] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>

          <div className="max-h-[420px] overflow-y-auto py-2">
            {Object.keys(grouped).length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                No fields match &ldquo;{query}&rdquo;.
              </p>
            )}
            {(["text", "choice", "advanced"] as const).map((groupKey) => {
              const items = grouped[groupKey];
              if (!items?.length) return null;
              return (
                <div key={groupKey} className="mb-2 last:mb-0">
                  <p className="px-3 pb-1.5 pt-1 text-[9px] font-medium uppercase tracking-[0.3em] text-muted-foreground/70">
                    {GROUP_LABELS[groupKey]}
                  </p>
                  {items.map((f) => {
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.type}
                        type="button"
                        onClick={() => handleSelect(f.type)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-konoha-forest/30"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink text-konoha-orange/80">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {f.label}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            {f.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
