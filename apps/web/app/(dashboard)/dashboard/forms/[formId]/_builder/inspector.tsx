"use client";

import { Plus, X, GripVertical, GitBranch, SplitSquareHorizontal } from "lucide-react";
import { getFieldDef } from "./field-catalog";
import type { BuilderField, ConditionalLogic, FieldType } from "./types";

interface Props {
  field: BuilderField;
  allFields: BuilderField[];
  onChange: (patch: Partial<BuilderField>) => void;
}

const inputCls =
  "w-full h-10 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20";

const textareaCls =
  "w-full min-h-[72px] rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20";

const labelCls =
  "block text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground";

const selectCls =
  "h-9 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-2 text-xs text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20";

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

const OPERATOR_LABELS: Record<string, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

export function FieldInspector({ field, allFields, onChange }: Props) {
  const def = getFieldDef(field.type);
  const Icon = def.icon;

  // Fields that appear before this one (to avoid circular conditions)
  const precedingFields = allFields.filter((f) => f.order < field.order && f.id !== field.id);

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

  // Conditional logic helpers
  const logic = field.conditionalLogic;
  const hasLogic = !!logic && logic.conditions.length > 0;

  const setLogic = (patch: Partial<ConditionalLogic> | null) => {
    if (patch === null) {
      onChange({ conditionalLogic: null });
      return;
    }
    const base: ConditionalLogic = logic ?? {
      action: "show",
      conditions: [],
      logicOperator: "and",
    };
    onChange({ conditionalLogic: { ...base, ...patch } });
  };

  const addCondition = () => {
    const first = precedingFields[0];
    if (!first) return;
    const conditions = [...(logic?.conditions ?? [])];
    conditions.push({ fieldId: first.id, operator: "equals", value: "" });
    setLogic({ conditions });
  };

  const updateCondition = (idx: number, patch: Partial<ConditionalLogic["conditions"][0]>) => {
    const conditions = [...(logic?.conditions ?? [])];
    const cur = conditions[idx];
    if (!cur) return;
    conditions[idx] = { ...cur, ...patch };
    setLogic({ conditions });
  };

  const removeCondition = (idx: number) => {
    const conditions = [...(logic?.conditions ?? [])];
    conditions.splice(idx, 1);
    if (conditions.length === 0) {
      setLogic(null);
    } else {
      setLogic({ conditions });
    }
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
          aria-label="Question"
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
          aria-label="Help text"
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
            aria-label="Placeholder"
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
                key={opt.value || `opt-${idx}`}
                className="flex items-center gap-2 rounded-md border border-konoha-forest/40 bg-konoha-ink/40 p-1.5"
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                <input
                  aria-label="Option label"
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
                  aria-label="Min"
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
                aria-label="Max"
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
                  aria-label="Min label"
                  className={inputCls}
                  value={field.minLabel ?? ""}
                  placeholder="e.g. Not at all"
                  onChange={(e) => onChange({ minLabel: e.target.value || null })}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelCls}>Max label</span>
                <input
                  aria-label="Max label"
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
                aria-label="Minimum length"
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
                aria-label="Maximum length"
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
                aria-label="Minimum value"
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
                aria-label="Maximum value"
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

      {/* ──── Page Break ──── */}
      <div className="flex flex-col gap-3 rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-3">
        <div className="flex items-center gap-2">
          <SplitSquareHorizontal className="h-3.5 w-3.5 text-konoha-orange/80" />
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange/80">
            Page Break
          </span>
        </div>
        <Toggle
          label="Start new page before this field"
          description="Splits the form into multiple pages at this point"
          checked={field.pageBreak ?? false}
          onChange={(v) => onChange({ pageBreak: v })}
        />
        {field.pageBreak && (
          <>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Page title</span>
              <input
                className={inputCls}
                value={field.pageTitle ?? ""}
                placeholder="e.g. Section 2"
                onChange={(e) => onChange({ pageTitle: e.target.value || null })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Page description</span>
              <input
                className={inputCls}
                value={field.pageDescription ?? ""}
                placeholder="Optional description for this page"
                onChange={(e) => onChange({ pageDescription: e.target.value || null })}
              />
            </label>
          </>
        )}
      </div>

      {/* ──── Conditional Logic ──── */}
      {precedingFields.length > 0 && (
        <div className="flex flex-col gap-3 rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5 text-konoha-orange/80" />
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange/80">
                Conditional Logic
              </span>
            </div>
            {hasLogic && (
              <button
                type="button"
                onClick={() => setLogic(null)}
                className="text-[9px] uppercase tracking-[0.2em] text-konoha-akatsuki hover:text-konoha-akatsuki/80"
              >
                Clear
              </button>
            )}
          </div>

          {!hasLogic ? (
            <button
              type="button"
              onClick={addCondition}
              className="flex h-9 items-center justify-center gap-2 rounded-md border border-dashed border-konoha-forest/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
            >
              <Plus className="h-3.5 w-3.5" />
              Add condition
            </button>
          ) : (
            <>
              {/* Action selector */}
              <div className="flex items-center gap-2">
                <select
                  className={selectCls}
                  value={logic?.action ?? "show"}
                  onChange={(e) => setLogic({ action: e.target.value as "show" | "hide" })}
                >
                  <option value="show">Show this field</option>
                  <option value="hide">Hide this field</option>
                </select>
                <span className="text-[10px] text-muted-foreground">when</span>
                <select
                  className={selectCls}
                  value={logic?.logicOperator ?? "and"}
                  onChange={(e) => setLogic({ logicOperator: e.target.value as "and" | "or" })}
                >
                  <option value="and">ALL</option>
                  <option value="or">ANY</option>
                </select>
                <span className="text-[10px] text-muted-foreground">match:</span>
              </div>

              {/* Conditions */}
              <div className="flex flex-col gap-2">
                {(logic?.conditions ?? []).map((cond, idx) => {
                  const targetField = allFields.find((f) => f.id === cond.fieldId);
                  const needsValue = cond.operator !== "is_empty" && cond.operator !== "is_not_empty";
                  const targetHasOptions = targetField && TYPES_WITH_OPTIONS.includes(targetField.type);

                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-1.5 rounded-md border border-konoha-forest/40 bg-konoha-ink/20 p-2"
                    >
                      <div className="flex items-center gap-1.5">
                        <select
                          className={`${selectCls} min-w-0 flex-1`}
                          value={cond.fieldId}
                          onChange={(e) => updateCondition(idx, { fieldId: e.target.value })}
                        >
                          {precedingFields.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label || "Untitled"}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeCondition(idx)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-konoha-akatsuki/15 hover:text-konoha-akatsuki"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          className={`${selectCls} min-w-0 flex-1`}
                          value={cond.operator}
                          onChange={(e) =>
                            updateCondition(idx, {
                              operator: e.target.value as ConditionalLogic["conditions"][0]["operator"],
                            })
                          }
                        >
                          {Object.entries(OPERATOR_LABELS).map(([val, lab]) => (
                            <option key={val} value={val}>
                              {lab}
                            </option>
                          ))}
                        </select>
                        {needsValue && (
                          targetHasOptions ? (
                            <select
                              className={`${selectCls} min-w-0 flex-1`}
                              value={cond.value ?? ""}
                              onChange={(e) => updateCondition(idx, { value: e.target.value })}
                            >
                              <option value="">Select…</option>
                              {(targetField?.options ?? []).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className="h-9 min-w-0 flex-1 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
                              value={cond.value ?? ""}
                              placeholder="value"
                              onChange={(e) => updateCondition(idx, { value: e.target.value })}
                            />
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addCondition}
                className="flex h-8 items-center justify-center gap-2 rounded-md border border-dashed border-konoha-forest/60 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
              >
                <Plus className="h-3 w-3" />
                Add condition
              </button>
            </>
          )}
        </div>
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
