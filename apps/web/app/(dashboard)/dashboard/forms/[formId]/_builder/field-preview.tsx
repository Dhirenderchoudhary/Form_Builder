"use client";

import { Star } from "lucide-react";
import type { BuilderField } from "./types";

/**
 * Renders a field as it would appear to a respondent.
 * Read-only for the canvas; we just mirror the visual look.
 */
export function FieldPreview({ field }: { field: BuilderField }) {
  const baseInput =
    "w-full h-11 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20";

  switch (field.type) {
    case "short_text":
    case "email":
    case "phone":
    case "url":
      return (
        <input
          type={
            field.type === "email"
              ? "email"
              : field.type === "url"
                ? "url"
                : field.type === "phone"
                  ? "tel"
                  : "text"
          }
          placeholder={field.placeholder ?? ""}
          className={baseInput}
          disabled
        />
      );

    case "number":
      return (
        <input
          type="number"
          placeholder={field.placeholder ?? "0"}
          className={baseInput}
          disabled
        />
      );

    case "long_text":
      return (
        <textarea
          rows={4}
          placeholder={field.placeholder ?? ""}
          className="w-full min-h-[100px] rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60"
          disabled
        />
      );

    case "date":
      return <input type="date" className={baseInput} disabled />;

    case "time":
      return <input type="time" className={baseInput} disabled />;

    case "select": {
      const opts = field.options ?? [];
      return (
        <select className={baseInput} disabled defaultValue="">
          <option value="" disabled>
            Choose one…
          </option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }

    case "multi_select": {
      const opts = field.options ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {opts.map((o) => (
            <span
              key={o.value}
              className="cursor-default rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-1.5 text-xs text-muted-foreground"
            >
              {o.label}
            </span>
          ))}
        </div>
      );
    }

    case "checkbox":
      return (
        <label className="flex cursor-default items-center gap-3 text-sm text-muted-foreground">
          <span className="flex h-5 w-5 items-center justify-center rounded border-[1.5px] border-konoha-forest bg-konoha-ink" />
          <span>{field.label}</span>
        </label>
      );

    case "rating": {
      const max = field.maxValue ?? 5;
      return (
        <div className="flex items-center gap-1.5">
          {Array.from({ length: max }).map((_, i) => (
            <Star
              key={i}
              className="h-6 w-6 text-konoha-forest"
              strokeWidth={1.5}
            />
          ))}
        </div>
      );
    }

    case "scale": {
      const min = field.minValue ?? 1;
      const max = field.maxValue ?? 10;
      return (
        <div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: max - min + 1 }).map((_, i) => (
              <span
                key={i}
                className="flex h-9 min-w-[36px] items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-2 text-xs text-muted-foreground"
              >
                {min + i}
              </span>
            ))}
          </div>
          {(field.minLabel || field.maxLabel) && (
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>{field.minLabel ?? ""}</span>
              <span>{field.maxLabel ?? ""}</span>
            </div>
          )}
        </div>
      );
    }

    case "file_upload":
      return (
        <div className="flex h-24 items-center justify-center rounded-md border-2 border-dashed border-konoha-forest/60 bg-konoha-ink/40 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Drop your scroll here
        </div>
      );

    default:
      return null;
  }
}
