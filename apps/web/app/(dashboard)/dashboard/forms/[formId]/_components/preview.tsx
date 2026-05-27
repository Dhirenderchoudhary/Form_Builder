"use client";

import { Star } from "lucide-react";
import type { FieldRowData } from "./field-row";
import { KonohaLeaf } from "@/components/konoha/leaf";

interface Props {
  title: string;
  description: string | null;
  fields: FieldRowData[];
}

/**
 * Live preview of the form, themed like the /naruto demo.
 * Stateless — it just renders inputs at their default empty state.
 */
export function Preview({ title, description, fields }: Props) {
  return (
    <div className="scroll-card overflow-hidden">
      <div className="border-b border-konoha-forest/40 bg-konoha-ink/40 px-4 py-2.5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Live Preview · 立絵
        </p>
      </div>

      <div className="bg-konoha-ink/40 p-6 md:p-10">
        {/* Form header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 w-12">
            <KonohaLeaf size={48} color="#FF6B00" glow />
          </div>
          <h2 className="font-heading text-2xl font-black text-konoha-orange md:text-3xl text-glow-orange">
            {title || "Untitled Scroll"}
          </h2>
          {description && (
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          <div className="mx-auto mt-4 h-px w-24 chakra-divider" />
        </div>

        {/* Fields */}
        {fields.length === 0 ? (
          <div className="rounded-md border border-dashed border-konoha-forest/60 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Add fields to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {fields.map((f) => (
              <FieldPreview key={f.id} field={f} />
            ))}
          </div>
        )}

        {/* Submit button */}
        {fields.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              className="btn-rasengan h-11 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-8 font-heading text-xs uppercase tracking-[0.18em] text-white shadow-[0_0_30px_rgba(255,107,0,0.35)]"
            >
              Submit Mission Scroll
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: FieldRowData }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {field.label}
        {field.required && <span className="text-konoha-orange">✦</span>}
      </label>
      <FieldInput field={field} />
      {field.helpText && (
        <p className="mt-1.5 text-[11px] text-muted-foreground/80">
          {field.helpText}
        </p>
      )}
    </div>
  );
}

const baseInput =
  "w-full rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-konoha-orange focus:outline-none focus:ring-2 focus:ring-konoha-orange/20";

function FieldInput({ field }: { field: FieldRowData }) {
  switch (field.type) {
    case "long_text":
      return (
        <textarea
          rows={4}
          placeholder="…"
          className={`${baseInput} min-h-[100px] resize-y`}
          disabled
        />
      );

    case "select":
      return (
        <select className={`${baseInput} appearance-none`} disabled defaultValue="">
          <option value="" disabled>
            Choose…
          </option>
          {(field.options ?? []).map((o, i) => (
            <option key={i} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "multi_select":
      return (
        <div className="flex flex-wrap gap-1.5">
          {(field.options ?? []).length === 0 ? (
            <span className="text-xs italic text-muted-foreground/60">
              No options yet
            </span>
          ) : (
            (field.options ?? []).map((o, i) => (
              <button
                key={i}
                type="button"
                disabled
                className="rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-1.5 text-xs text-muted-foreground"
              >
                {o.label}
              </button>
            ))
          )}
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-4 w-4 rounded border border-konoha-forest/80 bg-konoha-ink" />
          <span>Confirm</span>
        </label>
      );

    case "rating":
      return (
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 text-konoha-forest" />
          ))}
        </div>
      );

    case "scale":
      return (
        <div className="space-y-1.5">
          <input
            type="range"
            disabled
            className="w-full accent-konoha-orange"
            defaultValue={50}
          />
          <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Genin</span>
            <span>Kage</span>
          </div>
        </div>
      );

    case "file_upload":
      return (
        <div className="rounded-md border-2 border-dashed border-konoha-forest/60 px-4 py-6 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Drop your scroll here
        </div>
      );

    case "date":
      return <input type="date" className={baseInput} disabled />;
    case "time":
      return <input type="time" className={baseInput} disabled />;
    case "email":
      return <input type="email" placeholder="hawk@konohagakure.jp" className={baseInput} disabled />;
    case "number":
      return <input type="number" placeholder="0" className={baseInput} disabled />;
    case "phone":
      return <input type="tel" placeholder="…" className={baseInput} disabled />;
    case "url":
      return <input type="url" placeholder="https://…" className={baseInput} disabled />;
    case "short_text":
    default:
      return <input type="text" placeholder="…" className={baseInput} disabled />;
  }
}
