"use client";

import { useState } from "react";
import { QrCode, Copy, Check, Download, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  formId: string;
  slug: string;
}

export function QrCodeSection({ formId, slug }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const formUrl = `${window.location.origin}/f/${slug}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById(`qr-code-${formId}`);
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
      downloadLink.download = `${slug}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-3 text-left transition-colors hover:border-konoha-orange/50"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink text-konoha-orange">
            <QrCode className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">QR Code</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Share form via QR code
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-md border border-konoha-orange/60 bg-konoha-orange/10 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink text-konoha-orange">
            <QrCode className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-medium text-foreground">QR Code</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-konoha-forest/60 bg-konoha-ink text-muted-foreground hover:border-konoha-orange hover:text-konoha-orange"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg bg-white p-3">
          <QRCodeSVG
            id={`qr-code-${formId}`}
            value={formUrl}
            size={180}
            level="H"
            includeMargin={false}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        <div className="w-full space-y-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2 text-sm text-foreground transition-colors hover:border-konoha-orange hover:text-konoha-orange"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-konoha-forest/60 bg-konoha-ink/60 px-3 py-2 text-sm text-foreground transition-colors hover:border-konoha-orange hover:text-konoha-orange"
          >
            <Download className="h-4 w-4" />
            <span>Download QR Code</span>
          </button>
        </div>

        <div className="w-full rounded-md border border-konoha-forest/40 bg-konoha-ink/30 p-2">
          <p className="truncate font-mono text-xs text-konoha-orange">{formUrl}</p>
        </div>
      </div>
    </div>
  );
}
