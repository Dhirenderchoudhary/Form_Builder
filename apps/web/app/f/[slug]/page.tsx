import type { Metadata } from "next";
import { use } from "react";
import { FormView } from "./_components/form-view";

export const metadata: Metadata = {
  title: "Fill Scroll — Konoha Forms",
  description: "Submit your answers to this mission scroll.",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default function PublicFormPage({ params }: Props) {
  const { slug } = use(params);
  return <FormView slug={slug} />;
}
