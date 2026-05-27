"use client";

import { use } from "react";
import { Builder } from "./_builder/builder";

interface Props {
  params: Promise<{ formId: string }>;
}

export default function FormBuilderPage({ params }: Props) {
  const { formId } = use(params);
  return <Builder formId={formId} />;
}
