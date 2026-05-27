"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, LayoutTemplate } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  KonohaInput,
  KonohaTextarea,
} from "@/components/konoha/dialog";
import { useToast } from "@/components/konoha/toast";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TITLE_MAX = 80;
const DESC_MAX = 240;

/**
 * "Forge a New Scroll" — creates a draft form and routes the user
 * to its builder page (which is a stub for now — Pass 3).
 */
export function CreateFormDialog({ open, onClose }: Props) {
  const { push } = useRouter();
  const toast = useToast();
  const utils = trpc.useUtils();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string }>({});

  const reset = () => {
    setTitle("");
    setDescription("");
    setErrors({});
  };

  const handleClose = () => {
    if (createForm.isPending) return;
    onClose();
    // small delay so closing animation runs before clearing
    setTimeout(reset, 250);
  };

  const createForm = trpc.forms.create.useMutation({
    onSuccess: async (form: { id: string; title: string }) => {
      // refresh dashboard + forms list cache
      await utils.forms.list.invalidate();
      toast.push({
        variant: "success",
        title: "Scroll forged",
        message: `${form.title} is ready for fields.`,
      });
      onClose();
      reset();
      push(`/dashboard/forms/${form.id}`);
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Could not forge scroll",
        message: err.message?.slice(0, 120) ?? "Something went wrong.",
      });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const t = title.trim();
    if (!t) {
      setErrors({ title: "A scroll needs a title, shinobi." });
      return;
    }
    if (t.length > TITLE_MAX) {
      setErrors({ title: `Keep it under ${TITLE_MAX} characters.` });
      return;
    }

    setErrors({});
    createForm.mutate({
      title: t,
      description: description.trim() || undefined,
      visibility: "unlisted",
      collectEmail: false,
      settings: {},
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Forge a New Scroll"
      subtitle="Mission · 巻物"
      width="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <KonohaInput
          label="Scroll Title"
          placeholder="e.g. Chunin Exam Registration"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          maxLength={TITLE_MAX + 20}
          disabled={createForm.isPending}
          error={errors.title}
          hint={`${title.length}/${TITLE_MAX} characters`}
        />

        <KonohaTextarea
          label="Brief"
          placeholder="What does this scroll capture? Who should fill it out?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESC_MAX + 20}
          disabled={createForm.isPending}
          hint={`Optional · ${description.length}/${DESC_MAX}`}
        />

        <div className="rounded-md border border-konoha-orange/30 bg-konoha-orange/5 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-konoha-orange" />
            <div className="text-[11px] leading-relaxed text-muted-foreground">
              Your scroll starts in{" "}
              <span className="text-foreground">draft mode</span>. You&apos;ll
              add fields and customize the theme on the next screen, then
              publish when it&apos;s ready.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Link
            href="/dashboard/forms/new"
            onClick={handleClose}
            className="flex h-10 items-center gap-2 rounded-md border border-konoha-forest/60 px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-konoha-orange hover:text-konoha-orange"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Templates
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={createForm.isPending}
              className="h-10 rounded-md border border-konoha-forest/60 px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-konoha-orange hover:text-konoha-orange disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createForm.isPending || !title.trim()}
              className="btn-rasengan flex h-10 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-5 font-heading text-xs uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] transition-shadow hover:shadow-[0_0_30px_rgba(255,107,0,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {createForm.isPending ? "Forging…" : "Forge scroll"}
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
