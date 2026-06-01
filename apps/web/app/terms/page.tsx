import { Header } from "@/components/header";
import { KonohaLeaf } from "@/components/konoha/leaf";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Konoha Forms",
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen text-foreground">
      <Header />
      <main className="container mx-auto max-w-3xl px-6 pt-32 pb-24">
        <div className="mb-12 flex justify-center opacity-80">
          <KonohaLeaf size={48} color="#FF6B00" />
        </div>
        <h1 className="font-heading text-4xl font-black mb-8 text-konoha-orange text-center">
          Terms of the Shinobi
        </h1>
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p>
            By accessing or using Konoha Forms, you agree to be bound by these terms. If you disagree with any part of the terms, you must surrender your headband and leave the village.
          </p>
          <h2 className="font-heading text-2xl text-foreground mt-8">1. Acceptance of Terms</h2>
          <p>
            These terms represent the Will of Fire. You agree to use the service only for lawful missions and not for any unauthorized or rogue activities (e.g., joining the Akatsuki).
          </p>
          <h2 className="font-heading text-2xl text-foreground mt-8">2. Account Responsibilities</h2>
          <p>
            You are responsible for safeguarding your chakra signature (password) and for any activities or actions under your account. The Hokage cannot and will not be liable for any loss or damage arising from your failure to protect your credentials.
          </p>
          <h2 className="font-heading text-2xl text-foreground mt-8">3. Intellectual Property</h2>
          <p>
            The service and its original content, features, and functionality are owned by the Hidden Leaf Village and are protected by international copyright and trademark fuinjutsu.
          </p>
          <h2 className="font-heading text-2xl text-foreground mt-8">4. Termination</h2>
          <p>
            We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
          </p>
          <div className="mt-12 pt-8 border-t border-konoha-forest/40 text-center">
            <Link href="/" className="text-xs uppercase tracking-[0.2em] text-konoha-orange hover:text-konoha-gold">
              ← Return to Village
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
