/**
 * Loose types for the public form payload.
 * Matches what packages/services/form/index.ts → getPublicFormBySlug returns.
 */

export type PublicFieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "phone"
  | "url"
  | "date"
  | "time"
  | "select"
  | "multi_select"
  | "checkbox"
  | "rating"
  | "scale"
  | "file_upload";

export interface PublicField {
  id: string;
  type: PublicFieldType;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  order: number;
  validations: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    patternMessage?: string;
  } | null;
  options: Array<{ value: string; label: string }> | null;
  minValue: number | null;
  maxValue: number | null;
  minLabel: string | null;
  maxLabel: string | null;
}

export interface PublicForm {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  successMessage: string | null;
  collectEmail: boolean;
  themeId: string | null;
  fields: PublicField[];
}

/** Shape sent to public.submit */
export type AnswerValue = string | number | boolean | string[] | null;
