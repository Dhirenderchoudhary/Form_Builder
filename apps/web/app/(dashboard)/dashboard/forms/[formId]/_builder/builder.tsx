"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Pencil,
  Send,
  Lock,
  ExternalLink,
  Link2,
  Settings as SettingsIcon,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/components/konoha/toast";
import { AddFieldPopover } from "./add-field-popover";
import { FieldCard } from "./field-card";
import { FieldInspector } from "./inspector";
import { FormSettings } from "./form-settings";
import { FieldPreview } from "./field-preview";
import { getFieldDefaults, getFieldDef } from "./field-catalog";
import type { BuilderField, BuilderForm, FieldType } from "./types";

interface Props {
  formId: string;
}

type RightPane = "field" | "settings";

/**
 * Form builder — the heart of Konoha Forms.
 *
 * Layout:
 *   ┌────── topbar (title, status, preview/edit, publish) ──────┐
 *   │                                                            │
 *   │  Canvas (scrollable)        │  Inspector (sticky)         │
 *   │  - Form header               │  - Selected field config    │
 *   │  - Field cards (drag-drop)   │  - OR form-level settings   │
 *   │  - "Add field" popover       │                             │
 *   │                                                            │
 *   └────────────────────────────────────────────────────────────┘
 *
 * Autosave: field-level updates fire the tRPC mutation immediately.
 * Form-level settings batch via a 600ms debounce.
 */
export function Builder({ formId }: Props) {
  const router = useRouter();
  const toast = useToast();
  const utils = trpc.useUtils();

  const { data: serverForm, isLoading, isError } = trpc.forms.get.useQuery({ formId });

  // Local mirror of the form so the UI stays snappy while mutations fly.
  const [form, setForm] = useState<BuilderForm | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [rightPane, setRightPane] = useState<RightPane>("settings");
  const [previewMode, setPreviewMode] = useState(false);
  const [savingField, setSavingField] = useState<Record<string, boolean>>({});
  const [savingForm, setSavingForm] = useState(false);

  // Hydrate local state once the query resolves
  useEffect(() => {
    if (!serverForm) return;
    setForm(serverForm as BuilderForm);
  }, [serverForm]);

  const selectedField = useMemo(
    () => form?.fields.find((f) => f.id === selectedFieldId) ?? null,
    [form, selectedFieldId],
  );

  // ---------------------- Mutations ----------------------

  const addFieldMutation = trpc.forms.addField.useMutation({
    onSuccess: async (newField) => {
      await utils.forms.get.invalidate({ formId });
      await utils.forms.list.invalidate();
      // Select the newly created field and switch to the field pane.
      setSelectedFieldId((newField as BuilderField).id);
      setRightPane("field");
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Could not add field",
        message: err.message?.slice(0, 120) ?? "Try again.",
      });
    },
  });

  const updateFieldMutation = trpc.forms.updateField.useMutation({
    onSettled: async (_data, _err, vars) => {
      if (vars?.fieldId) {
        setSavingField((s) => ({ ...s, [vars.fieldId]: false }));
      }
      await utils.forms.get.invalidate({ formId });
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Field save failed",
        message: err.message?.slice(0, 120) ?? "",
      });
    },
  });

  const deleteFieldMutation = trpc.forms.deleteField.useMutation({
    onSuccess: async () => {
      await utils.forms.get.invalidate({ formId });
      await utils.forms.list.invalidate();
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Could not delete field",
        message: err.message?.slice(0, 120) ?? "",
      });
    },
  });

  const reorderFieldMutation = trpc.forms.reorderField.useMutation({
    onSuccess: async () => {
      await utils.forms.get.invalidate({ formId });
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Could not reorder",
        message: err.message?.slice(0, 120) ?? "",
      });
    },
  });

  const updateFormMutation = trpc.forms.update.useMutation({
    onSettled: async () => {
      setSavingForm(false);
      await utils.forms.get.invalidate({ formId });
      await utils.forms.list.invalidate();
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Could not save settings",
        message: err.message?.slice(0, 120) ?? "",
      });
    },
  });

  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: async () => {
      await utils.forms.get.invalidate({ formId });
      await utils.forms.list.invalidate();
      toast.push({
        variant: "success",
        title: "Scroll deployed",
        message: "Your link is live across the village.",
      });
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Cannot deploy",
        message: err.message?.slice(0, 140) ?? "Add a field first.",
      });
    },
  });

  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: async () => {
      await utils.forms.get.invalidate({ formId });
      await utils.forms.list.invalidate();
      toast.push({
        variant: "success",
        title: "Scroll sealed",
        message: "No new responses will be accepted.",
      });
    },
  });

  // ---------------------- Field operations ----------------------

  const handleAddField = (type: FieldType) => {
    const defaults = getFieldDefaults(type);
    addFieldMutation.mutate({
      formId,
      type,
      label: defaults.label,
      placeholder: defaults.placeholder,
      required: false,
      validations: {},
      options: defaults.options,
      minValue: defaults.minValue,
      maxValue: defaults.maxValue,
      minLabel: defaults.minLabel,
      maxLabel: defaults.maxLabel,
    });
  };

  const handleFieldChange = (fieldId: string, patch: Partial<BuilderField>) => {
    // Optimistic UI — update local state, then send the patch.
    setForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        fields: prev.fields.map((f) =>
          f.id === fieldId ? { ...f, ...patch } : f,
        ),
      };
    });
    setSavingField((s) => ({ ...s, [fieldId]: true }));

    // Strip server-managed fields and only send what changed
    const payload: Record<string, unknown> = {
      formId,
      fieldId,
    };
    if (patch.label !== undefined) payload.label = patch.label;
    if (patch.placeholder !== undefined) payload.placeholder = patch.placeholder ?? undefined;
    if (patch.helpText !== undefined) payload.helpText = patch.helpText ?? undefined;
    if (patch.required !== undefined) payload.required = patch.required;
    if (patch.options !== undefined) payload.options = patch.options ?? undefined;
    if (patch.validations !== undefined) payload.validations = patch.validations ?? {};
    if (patch.minValue !== undefined) payload.minValue = patch.minValue ?? undefined;
    if (patch.maxValue !== undefined) payload.maxValue = patch.maxValue ?? undefined;
    if (patch.minLabel !== undefined) payload.minLabel = patch.minLabel ?? undefined;
    if (patch.maxLabel !== undefined) payload.maxLabel = patch.maxLabel ?? undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateFieldMutation.mutate(payload as any);
  };

  const handleDuplicateField = (field: BuilderField) => {
    const defaults = getFieldDefaults(field.type);
    addFieldMutation.mutate({
      formId,
      type: field.type,
      label: `${field.label} (copy)`,
      placeholder: field.placeholder ?? undefined,
      helpText: field.helpText ?? undefined,
      required: field.required,
      validations: field.validations ?? {},
      options: field.options ?? defaults.options,
      minValue: field.minValue ?? defaults.minValue,
      maxValue: field.maxValue ?? defaults.maxValue,
      minLabel: field.minLabel ?? defaults.minLabel,
      maxLabel: field.maxLabel ?? defaults.maxLabel,
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, fields: prev.fields.filter((f) => f.id !== fieldId) };
    });
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
      setRightPane("settings");
    }
    deleteFieldMutation.mutate({ formId, fieldId });
  };

  // ---------------------- Form-level autosave ----------------------

  const formDebounceRef = useRef<number | null>(null);

  const handleFormChange = (patch: Partial<BuilderForm>) => {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
    setSavingForm(true);

    if (formDebounceRef.current) {
      window.clearTimeout(formDebounceRef.current);
    }

    formDebounceRef.current = window.setTimeout(() => {
      const payload: Record<string, unknown> = { formId };
      if (patch.title !== undefined) payload.title = patch.title;
      if (patch.description !== undefined) payload.description = patch.description ?? undefined;
      if (patch.visibility !== undefined) payload.visibility = patch.visibility;
      if (patch.collectEmail !== undefined) payload.collectEmail = patch.collectEmail;
      if (patch.successMessage !== undefined) payload.successMessage = patch.successMessage ?? undefined;
      if (patch.themeId !== undefined) payload.themeId = patch.themeId ?? null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateFormMutation.mutate(payload as any);
    }, 600);
  };

  // ---------------------- Drag and drop ----------------------

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    pos: "above" | "below";
  } | null>(null);

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    if (!draggingId || draggingId === id) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const pos = e.clientY < midpoint ? "above" : "below";
    setDropTarget({ id, pos });
  };

  const handleDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingId || !form) return;

    const dragIdx = form.fields.findIndex((f) => f.id === draggingId);
    let dropIdx = form.fields.findIndex((f) => f.id === id);
    if (dragIdx === -1 || dropIdx === -1) return;

    if (dropTarget?.pos === "below") dropIdx++;
    if (dragIdx < dropIdx) dropIdx--;
    if (dragIdx === dropIdx) {
      setDraggingId(null);
      setDropTarget(null);
      return;
    }

    // Optimistic reorder locally
    setForm((prev) => {
      if (!prev) return prev;
      const next = [...prev.fields];
      const [moved] = next.splice(dragIdx, 1);
      if (!moved) return prev;
      next.splice(dropIdx, 0, moved);
      return { ...prev, fields: next.map((f, i) => ({ ...f, order: i })) };
    });

    reorderFieldMutation.mutate({
      formId,
      fieldId: draggingId,
      newOrder: dropIdx,
    });

    setDraggingId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  // ---------------------- Render ----------------------

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.25em] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-konoha-orange" />
          Unsealing scroll…
        </div>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="scroll-card p-12 text-center">
        <p className="text-sm text-konoha-akatsuki">Scroll not found.</p>
        <Link
          href="/dashboard/forms"
          className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-konoha-orange hover:text-konoha-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to archive
        </Link>
      </div>
    );
  }

  const isPublished = form.status === "published";
  const isSealed = form.status === "closed";

  return (
    <div className="-mx-4 -my-6 flex min-h-[calc(100vh-4rem)] flex-col md:-mx-8 md:-my-10">
      {/* Builder topbar */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center gap-3 border-b border-konoha-forest/40 bg-konoha-ink/80 px-4 py-3 backdrop-blur-md md:px-8">
        <Link
          href="/dashboard/forms"
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-konoha-orange"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Archive</span>
        </Link>

        <div className="hidden h-4 w-px bg-konoha-forest/60 sm:block" />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="truncate font-heading text-base font-bold tracking-wide text-foreground">
            {form.title}
          </h1>
          <StatusBadge status={form.status} />
          {savingForm && (
            <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline-flex">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving
            </span>
          )}
        </div>

        {/* Preview toggle */}
        <div className="flex rounded-md border border-konoha-forest/60 bg-konoha-ink/60 p-1">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
              !previewMode ? "bg-konoha-orange/15 text-konoha-orange" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
              previewMode ? "bg-konoha-orange/15 text-konoha-orange" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>
        </div>

        {/* Publish / link actions */}
        {isPublished ? (
          <>
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/f/${form.slug}`;
                navigator.clipboard
                  .writeText(url)
                  .then(() =>
                    toast.push({
                      variant: "success",
                      title: "Link copied",
                      message: url.replace(window.location.origin, ""),
                    }),
                  )
                  .catch(() =>
                    toast.push({
                      variant: "error",
                      title: "Clipboard blocked",
                    }),
                  );
              }}
              className="hidden h-9 items-center gap-2 rounded-md border border-konoha-forest/60 px-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange md:flex"
            >
              <Link2 className="h-3.5 w-3.5" />
              Copy link
            </button>
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center gap-2 rounded-md border border-konoha-forest/60 px-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange md:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
            <button
              type="button"
              disabled={unpublishMutation.isPending}
              onClick={() => unpublishMutation.mutate({ formId })}
              className="flex h-9 items-center gap-2 rounded-md border border-konoha-akatsuki/40 bg-konoha-akatsuki/10 px-4 font-heading text-[11px] uppercase tracking-[0.18em] text-konoha-akatsuki hover:bg-konoha-akatsuki/20 disabled:opacity-50"
            >
              <Lock className="h-3.5 w-3.5" />
              Seal
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={publishMutation.isPending || form.fields.length === 0}
            onClick={() => publishMutation.mutate({ formId })}
            className="btn-rasengan flex h-9 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-4 font-heading text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            title={form.fields.length === 0 ? "Add at least one field first" : isSealed ? "Re-deploy this scroll" : "Deploy scroll"}
          >
            <Send className="h-3.5 w-3.5" />
            {publishMutation.isPending ? "Deploying…" : isSealed ? "Re-deploy" : "Deploy"}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 grid gap-6 px-4 py-6 md:px-8 md:py-8 lg:grid-cols-[1fr_360px]">
        {/* Canvas */}
        <div className="min-w-0">
          {previewMode ? (
            <PreviewView form={form} />
          ) : (
            <EditView
              form={form}
              selectedFieldId={selectedFieldId}
              draggingId={draggingId}
              dropTarget={dropTarget}
              onSelectField={(id) => {
                setSelectedFieldId(id);
                setRightPane("field");
              }}
              onDuplicate={handleDuplicateField}
              onDelete={handleDeleteField}
              onAdd={handleAddField}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onSelectFormSettings={() => {
                setSelectedFieldId(null);
                setRightPane("settings");
              }}
            />
          )}
        </div>

        {/* Inspector */}
        {!previewMode && (
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="scroll-card overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-konoha-forest/40">
                <TabBtn
                  active={rightPane === "field"}
                  onClick={() => {
                    if (selectedField) setRightPane("field");
                  }}
                  disabled={!selectedField}
                >
                  <Pencil className="h-3 w-3" />
                  Field
                </TabBtn>
                <TabBtn
                  active={rightPane === "settings"}
                  onClick={() => setRightPane("settings")}
                >
                  <SettingsIcon className="h-3 w-3" />
                  Scroll
                </TabBtn>
              </div>

              {rightPane === "field" && selectedField ? (
                <FieldInspector
                  field={selectedField}
                  onChange={(patch) => handleFieldChange(selectedField.id, patch)}
                />
              ) : rightPane === "field" ? (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                  <p className="text-sm text-foreground">No field selected.</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Click a field on the canvas to edit it
                  </p>
                </div>
              ) : (
                <FormSettings form={form} onChange={handleFormChange} />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ---------------------- Sub-components ---------------------- */

function TabBtn({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-3 text-[10px] uppercase tracking-[0.25em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-b-2 border-konoha-orange text-konoha-orange"
          : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: BuilderForm["status"] }) {
  const map = {
    draft: { label: "Draft", cls: "bg-konoha-forest/30 text-muted-foreground" },
    published: { label: "Live", cls: "bg-konoha-orange/15 text-konoha-orange" },
    closed: { label: "Sealed", cls: "bg-konoha-akatsuki/15 text-konoha-akatsuki" },
    archived: { label: "Archived", cls: "bg-konoha-forest/20 text-muted-foreground" },
  } as const;
  const s = map[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.2em] ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function EditView({
  form,
  selectedFieldId,
  draggingId,
  dropTarget,
  onSelectField,
  onSelectFormSettings,
  onDuplicate,
  onDelete,
  onAdd,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  form: BuilderForm;
  selectedFieldId: string | null;
  draggingId: string | null;
  dropTarget: { id: string; pos: "above" | "below" } | null;
  onSelectField: (id: string) => void;
  onSelectFormSettings: () => void;
  onDuplicate: (f: BuilderField) => void;
  onDelete: (id: string) => void;
  onAdd: (type: FieldType) => void;
  onDragStart: (id: string) => (e: React.DragEvent) => void;
  onDragOver: (id: string) => (e: React.DragEvent) => void;
  onDrop: (id: string) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Form header card */}
      <div
        onClick={onSelectFormSettings}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectFormSettings();
          }
        }}
        className={`mb-4 cursor-pointer rounded-md border bg-konoha-ink/40 p-5 transition-colors ${
          !selectedFieldId
            ? "border-konoha-orange/60 shadow-[0_0_24px_rgba(255,107,0,0.12)]"
            : "border-konoha-forest/40 hover:border-konoha-orange/40"
        }`}
      >
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
          Scroll Header
        </p>
        <h2 className="font-heading text-2xl font-black text-foreground">
          {form.title}
        </h2>
        {form.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {form.description}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3">
        {form.fields.length === 0 ? (
          <div className="rounded-md border border-dashed border-konoha-forest/60 bg-konoha-ink/30 p-12 text-center">
            <p className="font-heading text-lg font-bold tracking-wide">
              The scroll is blank
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Every great mission starts with a single question. Add your first
              field to begin.
            </p>
          </div>
        ) : (
          form.fields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              selected={selectedFieldId === field.id}
              isDragging={draggingId === field.id}
              isDropTarget={
                dropTarget?.id === field.id ? dropTarget.pos : null
              }
              onSelect={() => onSelectField(field.id)}
              onDuplicate={() => onDuplicate(field)}
              onDelete={() => onDelete(field.id)}
              onDragStart={onDragStart(field.id)}
              onDragOver={onDragOver(field.id)}
              onDrop={onDrop(field.id)}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>

      {/* Add field */}
      <div className="mt-4">
        <AddFieldPopover onAdd={onAdd} />
      </div>
    </div>
  );
}

function PreviewView({ form }: { form: BuilderForm }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="scroll-card p-8">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-konoha-orange">
          Live Preview · {getFieldDef("short_text").label.length > 0 && form.fields.length} field{form.fields.length === 1 ? "" : "s"}
        </div>
        <h1 className="font-heading text-3xl font-black tracking-tight">
          {form.title}
        </h1>
        {form.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {form.description}
          </p>
        )}

        <div className="mt-6 h-px chakra-divider" />

        <div className="mt-8 flex flex-col gap-6">
          {form.fields.length === 0 ? (
            <p className="rounded-md border border-dashed border-konoha-forest/60 p-8 text-center text-sm text-muted-foreground">
              Add fields to see the live preview.
            </p>
          ) : (
            form.fields.map((field) => (
              <div key={field.id}>
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {field.label}
                  {field.required && <span className="ml-1 text-konoha-orange">✦</span>}
                </label>
                {field.helpText && (
                  <p className="mb-2 text-xs text-muted-foreground">{field.helpText}</p>
                )}
                <FieldPreview field={field} />
              </div>
            ))
          )}
        </div>

        {form.fields.length > 0 && (
          <button
            type="button"
            disabled
            className="btn-rasengan mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-5 font-heading text-xs uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] disabled:opacity-80"
          >
            Submit Scroll
          </button>
        )}
      </div>
    </div>
  );
}
