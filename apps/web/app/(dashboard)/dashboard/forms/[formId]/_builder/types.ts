/**
 * Builder-internal types — match what the backend returns from
 * forms.get and forms.list. Kept loose (with `unknown` fallbacks) since
 * backend procedures use `z.any()` outputs and we want to be defensive.
 */

export type FieldType =
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

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldValidations {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface BuilderField {
  id: string;
  formId: string;
  type: FieldType;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  order: number;
  validations: FieldValidations | null;
  options: FieldOption[] | null;
  minValue: number | null;
  maxValue: number | null;
  minLabel: string | null;
  maxLabel: string | null;
}

export interface BuilderForm {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: "draft" | "published" | "closed" | "archived";
  visibility: "public" | "unlisted";
  successMessage: string | null;
  collectEmail: boolean;
  publishedAt: string | Date | null;
  themeId: string | null;
  settings: {
    showProgressBar?: boolean;
    shuffleFields?: boolean;
    oneResponsePerIp?: boolean;
    requireAuth?: boolean;
    passwordHash?: string;
  } | null;
  fields: BuilderField[];
}
