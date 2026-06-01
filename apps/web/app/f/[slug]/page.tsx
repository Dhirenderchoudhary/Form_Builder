import type { Metadata } from "next";
import { use } from "react";
import { FormViewDynamic } from "./_components/form-view-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Dynamic import so the pg driver doesn't get bundled into edge/crash at module level
    const { db, formsTable, eq } = await import("@repo/database");
    const forms = await db
      .select({ title: formsTable.title, description: formsTable.description })
      .from(formsTable)
      .where(eq(formsTable.slug, slug))
      .limit(1);

    const form = forms[0];
    if (!form) {
      return { title: "Scroll Not Found — Konoha Forms" };
    }

    return {
      title: `${form.title} — Konoha Forms`,
      description: form.description ?? "Submit your answers to this mission scroll.",
      openGraph: {
        title: form.title,
        description: form.description ?? "Submit your answers to this mission scroll.",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: form.title,
        description: form.description ?? "Submit your answers to this mission scroll.",
      },
    };
  } catch (e) {
    // If DB is unreachable (e.g. missing env var on Vercel), return fallback metadata
    // The form will still load client-side via TRPC
    console.error("[generateMetadata] DB error for slug:", slug, e);
    return {
      title: "Mission Scroll — Konoha Forms",
      description: "Submit your answers to this mission scroll.",
    };
  }
}

export default function PublicFormPage({ params }: Props) {
  const { slug } = use(params);
  return <FormViewDynamic slug={slug} />;
}
