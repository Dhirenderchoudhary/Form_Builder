import Image from "next/image";
import type { HTMLAttributes } from "react";

type CharProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

const maskStyle = {
  WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
  maskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
};

/* ------------------------------------------------------------------
   Itachi
   Used as the dashboard's signature character.
   ------------------------------------------------------------------ */
export function ItachiSilhouette({ size = 220, className = "", ...rest }: CharProps) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, ...maskStyle, ...rest.style }}
      {...rest}
    >
      <Image
        src="/itachi.png"
        alt="Itachi"
        fill
        className="object-cover object-right-top brightness-150 contrast-125 saturate-110"
        sizes={`${size}px`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------
   Kakashi
   ------------------------------------------------------------------ */
export function KakashiSilhouette({ size = 200, className = "", ...rest }: CharProps) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, ...maskStyle, ...rest.style }}
      {...rest}
    >
      <Image
        src="/Kakashi.png"
        alt="Kakashi"
        fill
        className="object-cover object-center brightness-150 contrast-125 saturate-110"
        sizes={`${size}px`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------
   Naruto
   ------------------------------------------------------------------ */
export function NarutoSilhouette({ size = 200, className = "", ...rest }: CharProps) {
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, ...maskStyle, ...rest.style }}
      {...rest}
    >
      <Image
        src="/Naruto.png"
        alt="Naruto"
        fill
        className="object-cover object-center brightness-150 contrast-125 saturate-110"
        sizes={`${size}px`}
      />
    </div>
  );
}
