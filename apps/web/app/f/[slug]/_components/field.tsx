"use client";

import { Star } from "lucide-react";
import type { PublicField, AnswerValue } from "../types";

interface Props {
  field: PublicField;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
  onFirstInteract?: () => void;
  error?: string;
  disabled?: boolean;
}

const baseInput =
  "w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20 transition-colors";
const errorInput =
  "border-konoha-akatsuki/70 focus:border-konoha-akatsuki focus:ring-konoha-akatsuki/20";

export function FieldRenderer({
  field,
  value,
  onChange,
  onFirstInteract,
  error,
  disabled,
}: Props) {
  const handleFocus = () => onFirstInteract?.();
  const cls = `${baseInput} ${error ? errorInput : ""}`;

  switch (field.type) {
    case "short_text":
    case "email":
    case "url":
    case "phone": {
      const inputType =
        field.type === "email"
          ? "email"
          : field.type === "url"
            ? "url"
            : field.type === "phone"
              ? "tel"
              : "text";
      return (
        <input
          type={inputType}
          className={cls}
          value={(value as string) ?? ""}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          disabled={disabled}
          required={field.required}
          maxLength={field.validations?.maxLength}
        />
      );
    }

    case "number":
      return (
        <input
          type="number"
          className={cls}
          value={value === null || value === undefined ? "" : (value as number)}
          placeholder={field.placeholder ?? ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
          onFocus={handleFocus}
          disabled={disabled}
          min={field.validations?.min}
          max={field.validations?.max}
        />
      );

    case "long_text":
      return (
        <textarea
          rows={4}
          className={`${cls} min-h-[120px] resize-y leading-relaxed`}
          value={(value as string) ?? ""}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          disabled={disabled}
          maxLength={field.validations?.maxLength}
        />
      );

    case "date":
      return (
        <input
          type="date"
          className={cls}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          onFocus={handleFocus}
          disabled={disabled}
        />
      );

    case "time":
      return (
        <input
          type="time"
          className={cls}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          onFocus={handleFocus}
          disabled={disabled}
        />
      );

    case "select": {
      const options = field.options ?? [];
      return (
        <select
          className={`${cls} appearance-none cursor-pointer`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          onFocus={handleFocus}
          disabled={disabled}
        >
          <option value="">Choose…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }

    case "multi_select": {
      const options = field.options ?? [];
      const selected = (Array.isArray(value) ? value : []) as string[];
      const toggle = (v: string) => {
        const next = selected.includes(v)
          ? selected.filter((x) => x !== v)
          : [...selected, v];
        onChange(next);
        onFirstInteract?.();
      };
      return (
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const active = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                disabled={disabled}
                className={`rounded-md border px-3 py-2 text-xs transition-all ${
                  active
                    ? "border-konoha-orange bg-konoha-orange/15 text-konoha-orange shadow-[0_0_12px_rgba(255,107,0,0.25)]"
                    : "border-konoha-forest/60 bg-konoha-ink/60 text-muted-foreground hover:border-konoha-orange/50 hover:text-foreground"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      );
    }

    case "checkbox": {
      const checked = Boolean(value);
      return (
        <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
          <button
            type="button"
            onClick={() => {
              onChange(!checked);
              onFirstInteract?.();
            }}
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-[1.5px] transition-all ${
              checked
                ? "border-konoha-orange bg-konoha-orange shadow-[0_0_12px_rgba(255,107,0,0.4)]"
                : "border-konoha-forest hover:border-konoha-orange/60"
            }`}
          >
            {checked && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6 L 5 9 L 10 3"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <span>{field.label}</span>
        </label>
      );
    }

    case "rating": {
      const max = field.maxValue ?? 5;
      const current = (value as number) ?? 0;
      return (
        <div className="flex gap-1.5">
          {Array.from({ length: max }).map((_, i) => {
            const filled = i < current;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(i + 1);
                  onFirstInteract?.();
                }}
                disabled={disabled}
                aria-label={`Rate ${i + 1} out of ${max}`}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    filled
                      ? "fill-konoha-orange text-konoha-orange"
                      : "text-konoha-forest hover:text-konoha-orange/50"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>
      );
    }

    case "scale": {
      const min = field.minValue ?? 0;
      const max = field.maxValue ?? 100;
      const current = (value as number) ?? Math.floor((min + max) / 2);
      const pct = ((current - min) / (max - min)) * 100;
      return (
        <div className="space-y-3">
          <div className="relative h-2 rounded-full bg-konoha-forest/40">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-konoha-chakra to-konoha-orange shadow-[0_0_12px_rgba(255,107,0,0.5)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={current}
            onChange={(e) => onChange(Number(e.target.value))}
            onFocus={handleFocus}
            disabled={disabled}
            className="w-full accent-konoha-orange"
          />
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>{field.minLabel ?? min}</span>
            <span className="font-heading text-base font-bold text-konoha-orange">
              {current}
            </span>
            <span>{field.maxLabel ?? max}</span>
          </div>
        </div>
      );
    }

    case "file_upload":
      return (
        <label
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center transition-colors ${
            disabled
              ? "border-konoha-forest/40 opacity-50"
              : "border-konoha-forest/60 hover:border-konoha-orange/60 hover:bg-konoha-orange/5"
          }`}
        >
          <input
            type="file"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              onChange(f ? f.name : null);
              if (f) onFirstInteract?.();
            }}
          />
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {value ? String(value) : "Drop your scroll here"}
          </p>
          <p className="text-[10px] text-muted-foreground/60">Click to browse</p>
        </label>
      );

    default:
      return null;
  }
}
