import { Header } from "@/components/header";
import { KonohaLeaf } from "@/components/konoha/leaf";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Konoha Forms",
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen text-foreground">
      <Header />
      <main className="container mx-auto max-w-3xl px-6 pt-32 pb-24">
        <div className="mb-12 flex justify-center opacity-80">
          <KonohaLeaf size={48} color="#FF6B00" />
        </div>
        <h1 className="font-heading text-4xl font-black mb-8 text-konoha-orange text-center">
          Privacy Scroll
        </h1>
        <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
          <p>
            Welcome to Konoha Forms. This scroll outlines how we collect, use, and protect the intel you share with us while navigating the Five Great Nations.
          </p>
          <h2 className="font-heading text-2xl text-foreground mt-8">Information We Collect</h2>
          <p>
            When you register for a shinobi account, we collect basic chakra signatures (name, email). The forms you create and the intel (responses) collected from the field are stored securely in our archives.
          </p>
          <h2 className="font-heading text-2xl text-foreground mt-8">How We Use Your Intel</h2>
          <p>
            We use your data solely to provide and improve the Konoha Forms service. We do not sell your data to the Akatsuki or any other third parties.
          </p>
          <h2 className="font-heading text-2xl text-foreground mt-8">Data Security</h2>
          <p>
            Our archives are protected by advanced fuinjutsu (sealing techniques). However, no method of transmission over the internet is 100% secure.
          </p>
          <h2 className="font-heading text-2xl text-foreground mt-8">Contact the Hokage</h2>
          <p>
            If you have questions about your privacy, send a messenger hawk to{" "}
            <a href="mailto:support@konohaforms.com" className="text-konoha-orange hover:underline">
              support@konohaforms.com
            </a>
            .
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
