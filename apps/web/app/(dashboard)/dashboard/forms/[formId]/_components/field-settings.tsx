"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { FieldRowData } from "./field-row";
import { FIELD_TYPE_MAP } from "./field-types";

interface Props {
  field: FieldRowData;
  onUpdate: (patch: {
    label?: string;
    helpText?: string | null;
    required?: boolean;
    placeholder?: string | null;
    options?: { value: string; label: string }[];
    minValue?: number;
    maxValue?: number;
  }) => void;
  onClose: () => void;
  /** Truthy while a parent mutation is in-flight. */
  busy?: boolean;
}

export function FieldSettings({ field, onUpdate, onClose, busy }: Props) {
  const meta = FIELD_TYPE_MAP[field.type];

  // Local mirrors so typing feels instant; we push debounced patches up.
  const [label, setLabel] = useState(field.label);
  const [helpText, setHelpText] = useState(field.helpText ?? "");
  const [placeholder, setPlaceholder] = useState("");
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    field.options ?? [],
  );

  useEffect(() => {
    setLabel(field.label);
    setHelpText(field.helpText ?? "");
    setOptions(field.options ?? []);
  }, [field.id, field.label, field.helpText, field.options]);

  // Debounce text patches so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      const patch: Parameters<typeof onUpdate>[0] = {};
      if (label !== field.label) patch.label = label;
      if ((helpText || "") !== (field.helpText ?? "")) {
        patch.helpText = helpText.trim() ? helpText : null;
      }
      if (Object.keys(patch).length > 0) onUpdate(patch);
    }, 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label, helpText]);

  const updateOptions = (next: { value: string; label: string }[]) => {
    setOptions(next);
    onUpdate({ options: next });
  };

  const addOption = () => {
    const idx = options.length + 1;
    updateOptions([
      ...options,
      { value: `option_${idx}`, label: `Option ${idx}` },
    ]);
  };

  const updateOption = (i: number, label: string) => {
    const next = options.map((o, j) =>
      j === i
        ? {
            value: label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 40) || `option_${i}`,
            label,
          }
        : o,
    );
    updateOptions(next);
  };

  const removeOption = (i: number) => {
    updateOptions(options.filter((_, j) => j !== i));
  };

  return (
    <aside className="scroll-card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-konoha-forest/40 px-4 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
            Field Settings
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {meta.label}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <SettingField label="Label">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={busy}
            className="h-10 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
          />
        </SettingField>

        <SettingField label="Help text" hint="Shown below the field">
          <textarea
            value={helpText}
            onChange={(e) => setHelpText(e.target.value)}
            disabled={busy}
            placeholder="Optional guidance for the shinobi…"
            rows={2}
            className="min-h-[60px] w-full resize-none rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
          />
        </SettingField>

        <ToggleRow
          label="Required"
          hint="Block submission until filled"
          checked={field.required}
          disabled={busy}
          onChange={(v) => onUpdate({ required: v })}
        />

        {meta.hasOptions && (
          <SettingField label="Options" hint="Choices the shinobi can pick from">
            <div className="space-y-2">
              {options.length === 0 && (
                <p className="rounded-md border border-dashed border-konoha-forest/60 p-3 text-center text-[11px] text-muted-foreground">
                  No options yet. Add at least two for this field to work.
                </p>
              )}
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground/60 w-6 text-center">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => updateOption(i, e.target.value)}
                    disabled={busy}
                    className="h-9 flex-1 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    disabled={busy}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-konoha-akatsuki/15 hover:text-konoha-akatsuki disabled:opacity-30"
                    aria-label="Remove option"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-konoha-forest/60 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:border-konoha-orange/60 hover:text-konoha-orange disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
                Add option
              </button>
            </div>
          </SettingField>
        )}

        {meta.hasRange && (
          <div className="grid grid-cols-2 gap-3">
            <SettingField label="Min">
              <input
                type="number"
                defaultValue={field.type === "rating" ? 1 : 0}
                onBlur={(e) => onUpdate({ minValue: Number(e.target.value) })}
                disabled={busy}
                className="h-10 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
              />
            </SettingField>
            <SettingField label="Max">
              <input
                type="number"
                defaultValue={field.type === "rating" ? 5 : 100}
                onBlur={(e) => onUpdate({ maxValue: Number(e.target.value) })}
                disabled={busy}
                className="h-10 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
              />
            </SettingField>
          </div>
        )}

        <SettingField label="Placeholder" hint="Hint text inside the input">
          <input
            type="text"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            onBlur={() =>
              onUpdate({
                placeholder: placeholder.trim() ? placeholder : null,
              })
            }
            disabled={busy}
            className="h-10 w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 text-sm text-foreground focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20"
          />
        </SettingField>
      </div>
    </aside>
  );
}

function SettingField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      {children}
      {hint && (
        <p className="mt-1.5 text-[10px] text-muted-foreground/70">{hint}</p>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-konoha-forest/40 bg-konoha-ink/40 p-3">
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        {hint && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          checked ? "bg-konoha-orange" : "bg-konoha-forest"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
