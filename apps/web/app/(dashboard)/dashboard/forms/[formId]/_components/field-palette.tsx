"use client";

import { Plus } from "lucide-react";
import { FIELD_TYPES, type FieldType } from "./field-types";

interface Props {
  onAdd: (type: FieldType) => void;
  disabled?: boolean;
}

const sectionLabels: Record<string, string> = {
  text: "Text & Numbers",
  choice: "Choices",
  advanced: "Advanced",
};

export function FieldPalette({ onAdd, disabled }: Props) {
  const grouped = FIELD_TYPES.reduce<Record<string, typeof FIELD_TYPES>>(
    (acc, f) => {
      (acc[f.category] ||= []).push(f);
      return acc;
    },
    {},
  );

  return (
    <aside className="scroll-card flex flex-col overflow-hidden">
      <div className="border-b border-konoha-forest/40 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
          Field Library
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Click to add to your scroll
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {(["text", "choice", "advanced"] as const).map((cat) => (
          <div key={cat} className="mb-5 last:mb-0">
            <p className="mb-2 px-1 text-[9px] font-medium uppercase tracking-[0.3em] text-muted-foreground/70">
              {sectionLabels[cat]}
            </p>
            <div className="space-y-1">
              {grouped[cat]?.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.type}
                    type="button"
                    onClick={() => onAdd(f.type)}
                    disabled={disabled}
                    className="group flex w-full items-start gap-2.5 rounded-md border border-transparent px-2 py-2 text-left transition-colors hover:border-konoha-orange/40 hover:bg-konoha-forest/15 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink text-muted-foreground group-hover:border-konoha-orange/60 group-hover:text-konoha-orange">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground group-hover:text-konoha-orange">
                        {f.label}
                      </p>
                      <p className="truncate text-[10px] leading-tight text-muted-foreground">
                        {f.description}
                      </p>
                    </div>
                    <Plus className="mt-1.5 h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:text-konoha-orange group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
