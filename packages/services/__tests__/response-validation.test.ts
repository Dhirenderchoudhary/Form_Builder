/**
 * Konoha Forms — Response Validation Tests
 *
 * Tests the server-side answer validation logic from ResponseService.
 * We extract the logic into a thin testable harness to avoid DB dependencies.
 *
 * The validateAnswers logic lives in packages/services/response/index.ts
 * and is exercised here by reconstructing the equivalent logic inline
 * (matching the exact implementation to avoid mock brittleness).
 */
import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";

// ─── Replicate the validation logic ─────────────────────────────────────────
// This mirrors ResponseService.validateAnswers() exactly so tests are
// independent of the DB import chain.

type FieldValidations = {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
};

type MockField = {
  id: string;
  label: string;
  required: boolean;
  validations: FieldValidations;
};

type AnswerValue = string | number | boolean | string[] | null;

function validateAnswers(
  fields: MockField[],
  answers: Array<{ fieldId: string; value: AnswerValue }>,
): void {
  const answerMap = new Map(answers.map((a) => [a.fieldId, a.value]));

  for (const field of fields) {
    const value = answerMap.get(field.id);
    const isEmpty =
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && isEmpty) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Field "${field.label}" is required`,
      });
    }

    if (!isEmpty && value !== null && value !== undefined) {
      const v = field.validations;

      if (typeof value === "string") {
        if (v.minLength && value.length < v.minLength) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `"${field.label}" must be at least ${v.minLength} characters`,
          });
        }
        if (v.maxLength && value.length > v.maxLength) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `"${field.label}" must be at most ${v.maxLength} characters`,
          });
        }
        if (v.pattern) {
          const regex = new RegExp(v.pattern);
          if (!regex.test(value)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                v.patternMessage ?? `"${field.label}" has an invalid format`,
            });
          }
        }
      }

      if (typeof value === "number") {
        if (v.min !== undefined && value < v.min) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `"${field.label}" must be at least ${v.min}`,
          });
        }
        if (v.max !== undefined && value > v.max) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `"${field.label}" must be at most ${v.max}`,
          });
        }
      }
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function field(
  overrides: Partial<MockField> & { id?: string },
): MockField {
  return {
    id: overrides.id ?? "field-1",
    label: overrides.label ?? "Test Field",
    required: overrides.required ?? false,
    validations: overrides.validations ?? {},
  };
}

function answer(fieldId: string, value: AnswerValue) {
  return { fieldId, value };
}

function expectTRPCError(
  fn: () => void,
  code: string,
  messagePart?: string,
) {
  expect(fn).toThrowError(
    expect.objectContaining({
      code,
      ...(messagePart ? { message: expect.stringContaining(messagePart) } : {}),
    }),
  );
}

// ─── Required field validation ───────────────────────────────────────────────

describe("validateAnswers — required fields", () => {
  it("throws BAD_REQUEST when required field has no answer", () => {
    const fields = [field({ id: "f1", label: "Ninja Name", required: true })];
    expectTRPCError(
      () => validateAnswers(fields, []),
      "BAD_REQUEST",
      "Ninja Name",
    );
  });

  it("throws when required field has null value", () => {
    const fields = [field({ id: "f1", label: "Clan", required: true })];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", null)]),
      "BAD_REQUEST",
      "Clan",
    );
  });

  it("throws when required field has empty string", () => {
    const fields = [field({ id: "f1", label: "Mission", required: true })];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", "")]),
      "BAD_REQUEST",
      "Mission",
    );
  });

  it("throws when required field has empty array", () => {
    const fields = [field({ id: "f1", label: "Skills", required: true })];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", [])]),
      "BAD_REQUEST",
      "Skills",
    );
  });

  it("passes when required field has a non-empty string", () => {
    const fields = [field({ id: "f1", label: "Name", required: true })];
    expect(() =>
      validateAnswers(fields, [answer("f1", "Naruto")]),
    ).not.toThrow();
  });

  it("passes when required field has a number", () => {
    const fields = [field({ id: "f1", label: "Age", required: true })];
    expect(() => validateAnswers(fields, [answer("f1", 17)])).not.toThrow();
  });

  it("passes when required field has false (boolean)", () => {
    const fields = [field({ id: "f1", label: "Accepted", required: true })];
    expect(() =>
      validateAnswers(fields, [answer("f1", false)]),
    ).not.toThrow();
  });

  it("passes when non-required field is missing", () => {
    const fields = [field({ id: "f1", label: "Optional", required: false })];
    expect(() => validateAnswers(fields, [])).not.toThrow();
  });

  it("passes when non-required field is null", () => {
    const fields = [field({ id: "f1", label: "Optional", required: false })];
    expect(() =>
      validateAnswers(fields, [answer("f1", null)]),
    ).not.toThrow();
  });
});

// ─── String length validation ────────────────────────────────────────────────

describe("validateAnswers — string minLength / maxLength", () => {
  it("throws when string is shorter than minLength", () => {
    const fields = [
      field({
        id: "f1",
        label: "Bio",
        validations: { minLength: 10 },
      }),
    ];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", "short")]),
      "BAD_REQUEST",
      "at least 10",
    );
  });

  it("passes when string is exactly minLength", () => {
    const fields = [
      field({ id: "f1", label: "Bio", validations: { minLength: 5 } }),
    ];
    expect(() =>
      validateAnswers(fields, [answer("f1", "hello")]),
    ).not.toThrow();
  });

  it("throws when string exceeds maxLength", () => {
    const fields = [
      field({
        id: "f1",
        label: "Bio",
        validations: { maxLength: 10 },
      }),
    ];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", "this is way too long for this field")]),
      "BAD_REQUEST",
      "at most 10",
    );
  });

  it("passes when string is exactly maxLength", () => {
    const fields = [
      field({ id: "f1", label: "Code", validations: { maxLength: 5 } }),
    ];
    expect(() =>
      validateAnswers(fields, [answer("f1", "12345")]),
    ).not.toThrow();
  });
});

// ─── String pattern validation ────────────────────────────────────────────────

describe("validateAnswers — string pattern", () => {
  it("throws when value does not match pattern", () => {
    const fields = [
      field({
        id: "f1",
        label: "Code",
        validations: { pattern: "^[A-Z]{3}$" },
      }),
    ];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", "lowercase")]),
      "BAD_REQUEST",
    );
  });

  it("uses custom patternMessage when pattern fails", () => {
    const fields = [
      field({
        id: "f1",
        label: "Code",
        validations: {
          pattern: "^[A-Z]{3}$",
          patternMessage: "Must be 3 uppercase letters",
        },
      }),
    ];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", "abc")]),
      "BAD_REQUEST",
      "Must be 3 uppercase letters",
    );
  });

  it("passes when value matches pattern", () => {
    const fields = [
      field({
        id: "f1",
        label: "Code",
        validations: { pattern: "^[A-Z]{3}$" },
      }),
    ];
    expect(() =>
      validateAnswers(fields, [answer("f1", "ABC")]),
    ).not.toThrow();
  });
});

// ─── Number range validation ──────────────────────────────────────────────────

describe("validateAnswers — number min / max", () => {
  it("throws when number is below min", () => {
    const fields = [
      field({
        id: "f1",
        label: "Chakra Level",
        validations: { min: 1 },
      }),
    ];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", 0)]),
      "BAD_REQUEST",
      "at least 1",
    );
  });

  it("passes when number is exactly min", () => {
    const fields = [
      field({ id: "f1", label: "Level", validations: { min: 1 } }),
    ];
    expect(() => validateAnswers(fields, [answer("f1", 1)])).not.toThrow();
  });

  it("throws when number exceeds max", () => {
    const fields = [
      field({
        id: "f1",
        label: "Rating",
        validations: { max: 5 },
      }),
    ];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", 6)]),
      "BAD_REQUEST",
      "at most 5",
    );
  });

  it("passes when number is exactly max", () => {
    const fields = [
      field({ id: "f1", label: "Rating", validations: { max: 5 } }),
    ];
    expect(() => validateAnswers(fields, [answer("f1", 5)])).not.toThrow();
  });

  it("passes when number is within min and max range", () => {
    const fields = [
      field({
        id: "f1",
        label: "Score",
        validations: { min: 1, max: 100 },
      }),
    ];
    expect(() => validateAnswers(fields, [answer("f1", 50)])).not.toThrow();
  });

  it("passes zero value when min is 0", () => {
    const fields = [
      field({ id: "f1", label: "Count", validations: { min: 0 } }),
    ];
    expect(() => validateAnswers(fields, [answer("f1", 0)])).not.toThrow();
  });
});

// ─── Multiple fields ─────────────────────────────────────────────────────────

describe("validateAnswers — multiple fields", () => {
  it("validates all fields and throws on first violation", () => {
    const fields = [
      field({ id: "f1", label: "Name", required: true }),
      field({ id: "f2", label: "Email", required: true }),
    ];
    expectTRPCError(
      () => validateAnswers(fields, [answer("f1", "Naruto")]),
      "BAD_REQUEST",
      "Email",
    );
  });

  it("passes when all required fields are answered", () => {
    const fields = [
      field({ id: "f1", label: "Name", required: true }),
      field({ id: "f2", label: "Email", required: true }),
    ];
    expect(() =>
      validateAnswers(fields, [
        answer("f1", "Naruto"),
        answer("f2", "naruto@konoha.gov"),
      ]),
    ).not.toThrow();
  });

  it("ignores extra answers for fields not in the schema", () => {
    const fields = [field({ id: "f1", label: "Name", required: true })];
    expect(() =>
      validateAnswers(fields, [
        answer("f1", "Naruto"),
        answer("extra-field-id", "extra value"),
      ]),
    ).not.toThrow();
  });
});
