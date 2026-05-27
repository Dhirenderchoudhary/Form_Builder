/**
 * Runtime conditional logic evaluation for the public form view.
 * Evaluates whether a field should be visible based on its conditionalLogic
 * configuration and the current answer values.
 */

import type { PublicField, ConditionalLogic, AnswerValue } from "../types";

/**
 * Evaluate a single condition against the current values.
 */
function evaluateCondition(
  condition: ConditionalLogic["conditions"][0],
  values: Record<string, AnswerValue>,
): boolean {
  const fieldValue = values[condition.fieldId];
  const strValue = fieldValue !== null && fieldValue !== undefined ? String(fieldValue) : "";
  const isEmpty =
    fieldValue === null ||
    fieldValue === undefined ||
    fieldValue === "" ||
    (Array.isArray(fieldValue) && fieldValue.length === 0);

  switch (condition.operator) {
    case "is_empty":
      return isEmpty;
    case "is_not_empty":
      return !isEmpty;
    case "equals":
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value ?? "");
      }
      return strValue === (condition.value ?? "");
    case "not_equals":
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(condition.value ?? "");
      }
      return strValue !== (condition.value ?? "");
    case "contains":
      if (Array.isArray(fieldValue)) {
        return fieldValue.some((v) => v.includes(condition.value ?? ""));
      }
      return strValue.toLowerCase().includes((condition.value ?? "").toLowerCase());
    default:
      return true;
  }
}

/**
 * Evaluate whether a field should be visible given the current form values.
 * Returns true if the field should be shown, false if it should be hidden.
 */
export function isFieldVisible(
  field: PublicField,
  values: Record<string, AnswerValue>,
): boolean {
  const logic = field.conditionalLogic;

  // No conditional logic = always visible
  if (!logic || !logic.conditions || logic.conditions.length === 0) {
    return true;
  }

  const results = logic.conditions.map((cond) => evaluateCondition(cond, values));

  const conditionsMet =
    logic.logicOperator === "or"
      ? results.some(Boolean)
      : results.every(Boolean);

  // "show" action: field is visible only when conditions are met
  // "hide" action: field is hidden when conditions are met
  return logic.action === "show" ? conditionsMet : !conditionsMet;
}

/**
 * Split an ordered list of fields into pages based on pageBreak flags.
 * Returns an array of pages, each containing:
 *   - title: optional page title from the first field with pageBreak
 *   - description: optional page description
 *   - fields: the fields belonging to this page
 */
export interface FormPage {
  title: string | null;
  description: string | null;
  fields: PublicField[];
}

export function splitIntoPages(fields: PublicField[]): FormPage[] {
  const sorted = fields.slice().sort((a, b) => a.order - b.order);
  const pages: FormPage[] = [];
  let currentPage: FormPage = { title: null, description: null, fields: [] };

  for (const field of sorted) {
    if (field.pageBreak && currentPage.fields.length > 0) {
      // Start a new page
      pages.push(currentPage);
      currentPage = {
        title: field.pageTitle ?? null,
        description: field.pageDescription ?? null,
        fields: [field],
      };
    } else {
      if (field.pageBreak) {
        // First field has page break — set the title for this page
        currentPage.title = field.pageTitle ?? null;
        currentPage.description = field.pageDescription ?? null;
      }
      currentPage.fields.push(field);
    }
  }

  // Push the last page
  if (currentPage.fields.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}
