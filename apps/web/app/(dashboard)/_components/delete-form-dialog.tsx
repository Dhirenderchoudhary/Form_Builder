"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Dialog, KonohaInput } from "@/components/konoha/dialog";
import { useToast } from "@/components/konoha/toast";

interface Props {
  open: boolean;
  onClose: () => void;
  formId: string | null;
  formTitle: string;
}

/**
 * Type-to-confirm archive dialog.
 * The backend soft-deletes (sets status=archived), so the data is recoverable
 * from the DB even though the UI calls it "destroy".
 */
export function DeleteFormDialog({ open, onClose, formId, formTitle }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const toast = useToast();
  const utils = trpc.useUtils();

  const deleteForm = trpc.forms.delete.useMutation({
    onSuccess: async () => {
      await utils.forms.list.invalidate();
      toast.push({
        variant: "success",
        title: "Scroll sealed away",
        message: `${formTitle} has been archived.`,
      });
      onClose();
      setConfirmation("");
    },
    onError: (err) => {
      toast.push({
        variant: "error",
        title: "Could not archive scroll",
        message: err.message?.slice(0, 120) ?? "Something went wrong.",
      });
    },
  });

  const isMatch = confirmation.trim() === formTitle.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || !formId) return;
    deleteForm.mutate({ formId });
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (deleteForm.isPending) return;
        onClose();
        setConfirmation("");
      }}
      title="Seal this scroll away"
      subtitle="Caution · 注意"
      width="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex gap-3 rounded-md border border-konoha-akatsuki/40 bg-konoha-akatsuki/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-konoha-akatsuki" />
          <div className="text-sm leading-relaxed text-foreground">
            <span className="text-konoha-akatsuki">{formTitle}</span> will be
            archived and removed from your active scrolls. Existing responses
            stay safe in the village vault, but the public link will stop working.
          </div>
        </div>

        <KonohaInput
          label="Type the scroll's name to confirm"
          placeholder={formTitle}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          disabled={deleteForm.isPending}
          autoFocus
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (deleteForm.isPending) return;
              onClose();
              setConfirmation("");
            }}
            disabled={deleteForm.isPending}
            className="h-10 rounded-md border border-konoha-forest/60 px-4 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-konoha-orange hover:text-konoha-orange disabled:opacity-40"
          >
            Keep it
          </button>
          <button
            type="submit"
            disabled={!isMatch || deleteForm.isPending}
            className="flex h-10 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-akatsuki to-[#5a0000] px-5 font-heading text-xs uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(139,0,0,0.3)] transition-shadow hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {deleteForm.isPending ? "Sealing…" : "Seal it away"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
