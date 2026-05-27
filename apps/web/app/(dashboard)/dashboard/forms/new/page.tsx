"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ScrollText, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/konoha/toast";
import { FORM_TEMPLATES, type FormTemplate } from "./_data/templates";

export default function NewFormFromTemplatePage() {
  const router = useRouter();
  const toast = useToast();
  const utils = trpc.useUtils();
  const [loading, setLoading] = useState<string | null>(null);

  const createForm = trpc.forms.create.useMutation();
  const addField = trpc.forms.addField.useMutation();

  const handleSelect = async (template: FormTemplate | null) => {
    const name = template?.name ?? "Untitled Scroll";
    setLoading(template?.id ?? "blank");
    try {
      const form = await createForm.mutateAsync({
        title: template?.name ?? "Untitled Scroll",
        description: template?.description,
        visibility: "unlisted",
        collectEmail: false,
        settings: {},
      });

      // Bulk add fields from the template
      if (template) {
        for (let i = 0; i < template.fields.length; i++) {
          const f = template.fields[i]!;
          await addField.mutateAsync({
            formId: form.id,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            helpText: f.helpText,
            required: f.required ?? false,
            options: f.options,
            minValue: f.minValue,
            maxValue: f.maxValue,
            minLabel: f.minLabel,
            maxLabel: f.maxLabel,
            validations: {},
          });
        }
      }

      await utils.forms.list.invalidate();
      toast.push({
        variant: "success",
        title: "Scroll forged",
        message: `${name} is ready for editing.`,
      });
      router.push(`/dashboard/forms/${form.id}`);
    } catch (err) {
      toast.push({
        variant: "error",
        title: "Could not forge scroll",
        message: err instanceof Error ? err.message.slice(0, 120) : "Try again.",
      });
      setLoading(null);
    }
  };

  // Group templates by category
  const categories = [...new Set(FORM_TEMPLATES.map((t) => t.category))];

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-lg border border-konoha-forest/40 bg-gradient-to-br from-konoha-ink/80 via-konoha-ink/60 to-transparent p-6 md:p-10">
        <div className="relative max-w-2xl">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.4em] text-konoha-orange">
            <Sparkles className="h-3 w-3" />
            Templates · 型
          </p>
          <h1 className="font-heading text-3xl font-black leading-tight md:text-5xl">
            Start from a
            <span className="block text-konoha-orange text-glow-orange">
              Template.
            </span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Pick a pre-built scroll to get started instantly, or forge a blank
            scroll from scratch.
          </p>
        </div>
      </section>

      {/* Blank scroll option */}
      <section className="mb-10">
        <button
          type="button"
          onClick={() => handleSelect(null)}
          disabled={loading !== null}
          className="group flex w-full items-center gap-4 rounded-lg border border-dashed border-konoha-forest/60 bg-konoha-ink/40 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-konoha-orange/60 hover:shadow-[0_0_24px_rgba(255,107,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-konoha-forest bg-konoha-ink text-muted-foreground group-hover:border-konoha-orange/60 group-hover:text-konoha-orange">
            {loading === "blank" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ScrollText className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold tracking-wide text-foreground group-hover:text-konoha-orange">
              Start from scratch
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Blank scroll — add your own fields from the builder
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-konoha-orange" />
        </button>
      </section>

      {/* Templates by category */}
      {categories.map((category) => (
        <section key={category} className="mb-10">
          <h2 className="mb-4 font-heading text-base font-bold uppercase tracking-[0.2em] text-foreground">
            {category}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {FORM_TEMPLATES.filter((t) => t.category === category).map((template) => {
              const Icon = template.icon;
              const isLoading = loading === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template)}
                  disabled={loading !== null}
                  className="group flex flex-col gap-3 rounded-lg border border-konoha-forest/40 bg-konoha-ink/40 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-konoha-orange/60 hover:shadow-[0_0_24px_rgba(255,107,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-konoha-forest bg-konoha-ink text-muted-foreground group-hover:border-konoha-orange/60 group-hover:text-konoha-orange">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-heading font-bold tracking-wide text-foreground group-hover:text-konoha-orange">
                        {template.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {template.fields.length} fields
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(template.fields.map((f) => f.type))].slice(0, 5).map((type) => (
                      <span
                        key={type}
                        className="rounded-full border border-konoha-forest/40 bg-konoha-ink/60 px-2 py-0.5 text-[8px] uppercase tracking-[0.15em] text-muted-foreground"
                      >
                        {type.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
