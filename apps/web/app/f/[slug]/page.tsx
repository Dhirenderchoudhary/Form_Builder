"use client";

import { use } from "react";
import { FormView } from "./_components/form-view";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function PublicFormPage({ params }: Props) {
  const { slug } = use(params);
  return <FormView slug={slug} />;
}
