import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/providers";
import { KonohaAtmosphere } from "@/components/konoha/atmosphere";
import "./globals.css";

import { Cinzel, Noto_Sans_JP } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cinzel",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "Hidden Leaf Forms — Forge your jutsu",
  description:
    "Forms forged with the Will of Fire. Build, share, and analyse your missions in the Hidden Leaf Village.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#FF6B00",
          colorBackground: "#0F1A10",
          colorInputBackground: "#0D1A0D",
          colorText: "#F0E6C8",
          colorTextOnPrimaryBackground: "#FFFFFF",
          colorNeutral: "#8A9A7A",
          fontFamily: "var(--font-cinzel), serif",
        },
        elements: {
          card: "border border-konoha-forest",
        },
      }}
    >
      <html lang="en" className={`dark ${cinzel.variable} ${notoSansJP.variable}`}>
        <body className="antialiased">
          <KonohaAtmosphere />
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
