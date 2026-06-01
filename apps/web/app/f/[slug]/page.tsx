import type { Metadata } from "next";
import { use } from "react";
import { FormView } from "./_components/form-view";
import { ClientOnly } from "./_components/client-only";
import { db, formsTable, eq } from "@repo/database";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const forms = await db
    .select({ title: formsTable.title, description: formsTable.description })
    .from(formsTable)
    .where(eq(formsTable.slug, slug))
    .limit(1);

  const form = forms[0];
  if (!form) {
    return {
      title: "Scroll Not Found — Konoha Forms",
    };
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
}

export default function PublicFormPage({ params }: Props) {
  const { slug } = use(params);
  return (
    <ClientOnly>
      <FormView slug={slug} />
    </ClientOnly>
  );
}
