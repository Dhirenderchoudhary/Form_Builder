"use client";

import { Plus, X, GripVertical } from "lucide-react";
import { getFieldDef } from "./field-catalog";
import type { BuilderField, FieldType } from "./types";

interface Props {
  field: BuilderField;
  onChange: (patch: Partial<BuilderField>) => void;
}

const inputCls =
  "w-full h-10 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20";

const textareaCls =
  "w-full min-h-[72px] rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20";

const labelCls =
  "block text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground";

const TYPES_WITH_PLACEHOLDER: FieldType[] = [
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "url",
];

const TYPES_WITH_OPTIONS: FieldType[] = ["select", "multi_select"];

const TYPES_WITH_RANGE: FieldType[] = ["scale", "rating"];

const TYPES_WITH_TEXT_VALIDATION: FieldType[] = [
  "short_text",
  "long_text",
  "email",
  "url",
  "phone",
];

const TYPES_WITH_NUMBER_VALIDATION: FieldType[] = ["number"];

export function FieldInspector({ field, onChange }: Props) {
  const def = getFieldDef(field.type);
  const Icon = def.icon;

  const updateOption = (idx: number, patch: Partial<{ value: string; label: string }>) => {
    const opts = [...(field.options ?? [])];
    const current = opts[idx];
    if (!current) return;
    opts[idx] = { ...current, ...patch };
    onChange({ options: opts });
  };

  const removeOption = (idx: number) => {
    const opts = [...(field.options ?? [])];
    opts.splice(idx, 1);
    onChange({ options: opts });
  };

  const addOption = () => {
    const opts = [...(field.options ?? [])];
    const n = opts.length + 1;
    opts.push({ value: `opt${n}`, label: `Option ${n}` });
    onChange({ options: opts });
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Type pill */}
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink text-konoha-orange">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
          {def.label}
        </span>
      </div>

      {/* Label */}
      <label className="flex flex-col gap-2">
        <span className={labelCls}>Question</span>
        <input
          className={inputCls}
          value={field.label}
          placeholder="What do you want to ask?"
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </label>

      {/* Help text */}
      <label className="flex flex-col gap-2">
        <span className={labelCls}>Help text</span>
        <textarea
          className={textareaCls}
          value={field.helpText ?? ""}
          placeholder="Optional clarifying note shown below the field"
          onChange={(e) => onChange({ helpText: e.target.value || null })}
        />
      </label>

      {/* Placeholder */}
      {TYPES_WITH_PLACEHOLDER.includes(field.type) && (
        <label className="flex flex-col gap-2">
          <span className={labelCls}>Placeholder</span>
          <input
            className={inputCls}
            value={field.placeholder ?? ""}
            placeholder="Hint shown when empty"
            onChange={(e) => onChange({ placeholder: e.target.value || null })}
          />
        </label>
      )}

      {/* Required toggle */}
      <Toggle
        label="Required"
        description="Block submission if this is empty"
        checked={field.required}
        onChange={(v) => onChange({ required: v })}
      />

      {/* Options editor */}
      {TYPES_WITH_OPTIONS.includes(field.type) && (
        <div className="flex flex-col gap-3">
          <span className={labelCls}>Options</span>
          <div className="flex flex-col gap-1.5">
            {(field.options ?? []).map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-md border border-konoha-forest/40 bg-konoha-ink/40 p-1.5"
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                <input
                  className="h-7 flex-1 rounded bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
                  value={opt.label}
                  placeholder="Label"
                  onChange={(e) => updateOption(idx, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, "_").slice(0, 40) || `opt${idx + 1}` })}
                />
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  aria-label={`Remove option ${idx + 1}`}
                  className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-konoha-akatsuki/15 hover:text-konoha-akatsuki"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="flex h-9 items-center justify-center gap-2 rounded-md border border-dashed border-konoha-forest/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
          >
            <Plus className="h-3.5 w-3.5" />
            Add option
          </button>
        </div>
      )}

      {/* Range / scale */}
      {TYPES_WITH_RANGE.includes(field.type) && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {field.type === "scale" && (
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Min</span>
                <input
                  type="number"
                  className={inputCls}
                  value={field.minValue ?? 1}
                  onChange={(e) => onChange({ minValue: parseInt(e.target.value || "1", 10) })}
                />
              </label>
            )}
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Max</span>
              <input
                type="number"
                className={inputCls}
                value={field.maxValue ?? (field.type === "rating" ? 5 : 10)}
                onChange={(e) => onChange({ maxValue: parseInt(e.target.value || "10", 10) })}
              />
            </label>
          </div>

          {field.type === "scale" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Min label</span>
                <input
                  className={inputCls}
                  value={field.minLabel ?? ""}
                  placeholder="e.g. Not at all"
                  onChange={(e) => onChange({ minLabel: e.target.value || null })}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Max label</span>
                <input
                  className={inputCls}
                  value={field.maxLabel ?? ""}
                  placeholder="e.g. Absolutely"
                  onChange={(e) => onChange({ maxLabel: e.target.value || null })}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Validation: text length */}
      {TYPES_WITH_TEXT_VALIDATION.includes(field.type) && (
        <ValidationSection title="Length">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Min</span>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={field.validations?.minLength ?? ""}
                placeholder="—"
                onChange={(e) =>
                  onChange({
                    validations: {
                      ...(field.validations ?? {}),
                      minLength: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    },
                  })
                }
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Max</span>
              <input
                type="number"
                min={1}
                className={inputCls}
                value={field.validations?.maxLength ?? ""}
                placeholder="—"
                onChange={(e) =>
                  onChange({
                    validations: {
                      ...(field.validations ?? {}),
                      maxLength: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    },
                  })
                }
              />
            </label>
          </div>
        </ValidationSection>
      )}

      {/* Validation: numeric range */}
      {TYPES_WITH_NUMBER_VALIDATION.includes(field.type) && (
        <ValidationSection title="Number range">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Min</span>
              <input
                type="number"
                className={inputCls}
                value={field.validations?.min ?? ""}
                placeholder="—"
                onChange={(e) =>
                  onChange({
                    validations: {
                      ...(field.validations ?? {}),
                      min: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Max</span>
              <input
                type="number"
                className={inputCls}
                value={field.validations?.max ?? ""}
                placeholder="—"
                onChange={(e) =>
                  onChange({
                    validations: {
                      ...(field.validations ?? {}),
                      max: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
              />
            </label>
          </div>
        </ValidationSection>
      )}
    </div>
  );
}

function ValidationSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-3">
      <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange/80">
        {title}
      </span>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-3 text-left transition-colors hover:border-konoha-orange/50"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        )}
      </div>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-konoha-orange shadow-[0_0_12px_rgba(255,107,0,0.5)]" : "bg-konoha-forest/60"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
