"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Link2, Check, Download, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/components/konoha/toast";

interface Props {
  formId: string;
  slug: string;
}

export function SharePopover({ formId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  const formUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${slug}` : "";

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      toast.push({
        variant: "success",
        title: "Link copied",
        message: "You can now share this scroll.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.push({
        variant: "error",
        title: "Clipboard blocked",
      });
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById(`qr-code-${formId}-share`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${slug}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="btn-rasengan flex h-9 items-center gap-2 rounded-md bg-gradient-to-br from-konoha-orange to-[#cc4400] px-4 font-heading text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)]"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-[320px] overflow-hidden rounded-xl border border-konoha-orange/40 bg-konoha-ink/95 p-5 shadow-[0_12px_40px_rgba(255,107,0,0.25)] backdrop-blur-md animate-[fadeInUp_0.15s_ease]"
        >
          <div className="mb-4 flex items-center justify-between border-b border-konoha-forest/40 pb-3">
            <h3 className="font-heading text-sm uppercase tracking-[0.2em] text-foreground text-glow-orange">
              Share Scroll
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-muted-foreground hover:bg-konoha-forest/30 hover:text-konoha-orange"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-5">
            {/* QR Code */}
            <div className="rounded-xl bg-white p-4 shadow-inner">
              <QRCodeSVG
                id={`qr-code-${formId}-share`}
                value={formUrl}
                size={160}
                level="H"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>

            <div className="w-full space-y-3">
              {/* Copy Link Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="group flex w-full items-center justify-between rounded-md border border-konoha-forest/60 bg-konoha-ink px-4 py-2.5 text-sm text-foreground transition-all hover:border-konoha-orange"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground group-hover:text-konoha-orange" />
                  <span className="font-medium">Copy Link</span>
                </div>
                {copied ? <Check className="h-4 w-4 text-konoha-orange" /> : null}
              </button>

              {/* Download QR Code */}
              <button
                type="button"
                onClick={handleDownload}
                className="group flex w-full items-center justify-between rounded-md border border-konoha-forest/60 bg-konoha-ink px-4 py-2.5 text-sm text-foreground transition-all hover:border-konoha-orange"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground group-hover:text-konoha-orange" />
                  <span className="font-medium">Download QR</span>
                </div>
              </button>
            </div>

            {/* Read-only URL box */}
            <div className="w-full rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-2.5 text-center">
              <p className="truncate font-mono text-[10px] text-konoha-orange opacity-80">
                {formUrl}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
