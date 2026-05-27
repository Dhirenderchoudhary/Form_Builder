import type { PublicField, AnswerValue } from "../types";

/**
 * Mirror of the backend validation in packages/services/response/index.ts.
 * Runs client-side first so respondents see errors instantly without
 * a network round-trip. Backend re-runs the same checks for safety.
 */
export function validateField(field: PublicField, value: AnswerValue): string | null {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) {
    return `${field.label} is required`;
  }

  if (isEmpty) return null;

  const v = field.validations ?? {};

  if (typeof value === "string") {
    if (v.minLength && value.length < v.minLength) {
      return `${field.label} must be at least ${v.minLength} characters`;
    }
    if (v.maxLength && value.length > v.maxLength) {
      return `${field.label} must be at most ${v.maxLength} characters`;
    }
    if (v.pattern) {
      try {
        const regex = new RegExp(v.pattern);
        if (!regex.test(value)) {
          return v.patternMessage ?? `${field.label} has an invalid format`;
        }
      } catch {
        // ignore malformed pattern
      }
    }

    // Type-specific quick checks
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "That hawk address looks malformed.";
    }
    if (field.type === "url") {
      try {
        new URL(value);
      } catch {
        return "Enter a valid URL.";
      }
    }
  }

  if (typeof value === "number") {
    if (v.min !== undefined && value < v.min) {
      return `${field.label} must be at least ${v.min}`;
    }
    if (v.max !== undefined && value > v.max) {
      return `${field.label} must be at most ${v.max}`;
    }
  }

  return null;
}

export function validateAllFields(
  fields: PublicField[],
  values: Record<string, AnswerValue>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const err = validateField(field, values[field.id] ?? null);
    if (err) errors[field.id] = err;
  }
  return errors;
}
