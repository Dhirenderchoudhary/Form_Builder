"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Asterisk,
  GripVertical,
} from "lucide-react";
import { FIELD_TYPE_MAP, type FieldType } from "./field-types";

export interface FieldRowData {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  helpText?: string | null;
  options?: { value: string; label: string }[] | null;
}

interface Props {
  field: FieldRowData;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onLabelChange: (label: string) => void;
  onToggleRequired: () => void;
  onDelete: () => void;
  busy?: boolean;
}

export function FieldRow({
  field,
  index,
  total,
  selected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onLabelChange,
  onToggleRequired,
  onDelete,
  busy,
}: Props) {
  const meta = FIELD_TYPE_MAP[field.type];
  const Icon = meta.icon;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.label);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync external label changes back into the edit buffer.
  useEffect(() => {
    if (!editing) setDraft(field.label);
  }, [field.label, editing]);

  // Auto-focus when entering edit mode.
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    setEditing(false);
    if (trimmed && trimmed !== field.label) {
      onLabelChange(trimmed);
    } else {
      setDraft(field.label);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-start gap-3 rounded-md border bg-konoha-ink/60 p-3.5 transition-all cursor-pointer ${
        selected
          ? "border-konoha-orange/60 shadow-[0_0_24px_rgba(255,107,0,0.12)]"
          : "border-konoha-forest/40 hover:border-konoha-forest"
      }`}
    >
      {/* Drag handle (decorative — reorder uses arrow buttons) */}
      <div className="mt-1 hidden text-muted-foreground/50 sm:block">
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      {/* Type icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            {meta.label}
          </span>
          {field.required && (
            <span className="flex items-center gap-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-konoha-orange">
              <Asterisk className="h-2.5 w-2.5" />
              Required
            </span>
          )}
        </div>

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                setDraft(field.label);
                setEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 w-full bg-transparent text-sm font-heading font-bold tracking-wide text-foreground outline-none focus:ring-0"
          />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="mt-1 block w-full text-left text-sm font-heading font-bold tracking-wide text-foreground hover:text-konoha-orange"
          >
            {field.label}
          </button>
        )}

        {field.helpText && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            {field.helpText}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        <ActionBtn
          label="Move up"
          disabled={busy || index === 0}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </ActionBtn>
        <ActionBtn
          label="Move down"
          disabled={busy || index === total - 1}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </ActionBtn>
        <ActionBtn
          label={field.required ? "Make optional" : "Make required"}
          active={field.required}
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onToggleRequired();
          }}
        >
          <Asterisk className="h-3.5 w-3.5" />
        </ActionBtn>
        <ActionBtn
          label="Delete field"
          danger
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </ActionBtn>
      </div>

      {/* Index pill */}
      <span className="absolute -left-2 -top-2 hidden h-5 min-w-[20px] items-center justify-center rounded-full border border-konoha-forest bg-konoha-ink px-1 font-mono text-[9px] tabular-nums text-muted-foreground sm:flex">
        {index + 1}
      </span>
    </div>
  );
}

function ActionBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "text-muted-foreground hover:bg-konoha-akatsuki/15 hover:text-konoha-akatsuki"
          : active
            ? "bg-konoha-orange/15 text-konoha-orange"
            : "text-muted-foreground hover:bg-konoha-forest/30 hover:text-konoha-orange"
      }`}
    >
      {children}
    </button>
  );
}
