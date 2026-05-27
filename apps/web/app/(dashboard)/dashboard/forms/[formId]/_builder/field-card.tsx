"use client";

import { GripVertical, Copy, Trash2 } from "lucide-react";
import { getFieldDef } from "./field-catalog";
import { FieldPreview } from "./field-preview";
import type { BuilderField } from "./types";

interface Props {
  field: BuilderField;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  // drag handlers
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDropTarget: "above" | "below" | null;
}

export function FieldCard({
  field,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDropTarget,
}: Props) {
  const def = getFieldDef(field.type);
  const Icon = def.icon;

  return (
    <div className="relative" onDragOver={onDragOver} onDrop={onDrop}>
      {/* Drop indicator above */}
      {isDropTarget === "above" && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 rounded bg-konoha-orange shadow-[0_0_12px_#FF6B00]" />
      )}

      <div
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={`group relative cursor-pointer rounded-md border bg-konoha-ink/40 p-4 transition-all ${
          selected
            ? "border-konoha-orange shadow-[0_0_24px_rgba(255,107,0,0.18)]"
            : "border-konoha-forest/40 hover:border-konoha-orange/60"
        } ${isDragging ? "opacity-40" : ""}`}
      >
        {/* Drag handle */}
        <button
          type="button"
          aria-label="Drag to reorder"
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground/40 transition-colors hover:text-konoha-orange active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="pl-4">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink text-konoha-orange/80">
                <Icon className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {def.label}
              </span>
              {field.required && (
                <span className="text-konoha-orange" title="Required">
                  ✦
                </span>
              )}
            </div>

            {/* Row actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                aria-label="Duplicate field"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-konoha-forest/30 hover:text-konoha-orange"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Delete field"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-konoha-akatsuki/15 hover:text-konoha-akatsuki"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Label */}
          <p className="mb-3 font-heading text-sm font-bold tracking-wide text-foreground">
            {field.label || (
              <span className="italic text-muted-foreground/60">Untitled field</span>
            )}
          </p>

          {field.helpText && (
            <p className="mb-3 -mt-2 text-xs text-muted-foreground">{field.helpText}</p>
          )}

          {/* Preview */}
          <FieldPreview field={field} />
        </div>
      </div>

      {/* Drop indicator below */}
      {isDropTarget === "below" && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 rounded bg-konoha-orange shadow-[0_0_12px_#FF6B00]" />
      )}
    </div>
  );
}
