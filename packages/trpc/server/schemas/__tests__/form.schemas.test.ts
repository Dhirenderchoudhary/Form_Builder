/**
 * Konoha Forms — Zod Schema Test Suite
 *
 * Covers all schemas in packages/trpc/server/schemas/form.schemas.ts
 * Pure unit tests — no DB, no HTTP, no network calls.
 */
import { describe, it, expect } from "vitest";
import {
  fieldTypeSchema,
  fieldValidationsSchema,
  fieldOptionSchema,
  conditionalLogicSchema,
  formSettingsSchema,
  createFormSchema,
  updateFormSchema,
  createFieldSchema,
  updateFieldSchema,
  reorderFieldSchema,
  answerValueSchema,
  submitResponseSchema,
  trackEventSchema,
  paginationSchema,
} from "../form.schemas";

// ─── fieldTypeSchema ────────────────────────────────────────────────────────

describe("fieldTypeSchema", () => {
  const VALID_TYPES = [
    "short_text",
    "long_text",
    "email",
    "number",
    "phone",
    "url",
    "date",
    "time",
    "select",
    "multi_select",
    "checkbox",
    "rating",
    "scale",
    "file_upload",
  ] as const;

  it.each(VALID_TYPES)("accepts valid type %s", (type) => {
    const result = fieldTypeSchema.safeParse(type);
    expect(result.success).toBe(true);
  });

  it("rejects unknown type", () => {
    expect(fieldTypeSchema.safeParse("unknown_type").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(fieldTypeSchema.safeParse("").success).toBe(false);
  });

  it("rejects number", () => {
    expect(fieldTypeSchema.safeParse(42).success).toBe(false);
  });

  it("rejects null", () => {
    expect(fieldTypeSchema.safeParse(null).success).toBe(false);
  });
});

// ─── fieldValidationsSchema ─────────────────────────────────────────────────

describe("fieldValidationsSchema", () => {
  it("accepts empty object (all optional)", () => {
    const result = fieldValidationsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts all fields present", () => {
    const result = fieldValidationsSchema.safeParse({
      minLength: 2,
      maxLength: 100,
      min: 0,
      max: 999,
      pattern: "^[a-z]+$",
      patternMessage: "Lowercase only",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative minLength", () => {
    expect(
      fieldValidationsSchema.safeParse({ minLength: -1 }).success,
    ).toBe(false);
  });

  it("rejects zero maxLength", () => {
    expect(
      fieldValidationsSchema.safeParse({ maxLength: 0 }).success,
    ).toBe(false);
  });

  it("defaults to empty object when not provided", () => {
    const result = fieldValidationsSchema.safeParse(undefined);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({});
  });
});

// ─── fieldOptionSchema ───────────────────────────────────────────────────────

describe("fieldOptionSchema", () => {
  it("accepts valid option", () => {
    expect(
      fieldOptionSchema.safeParse({ value: "wind", label: "Wind Release" }).success,
    ).toBe(true);
  });

  it("accepts option with imageUrl", () => {
    expect(
      fieldOptionSchema.safeParse({
        value: "fire",
        label: "Fire Release",
        imageUrl: "https://konoha.gov/katon.png",
      }).success,
    ).toBe(true);
  });

  it("rejects empty value", () => {
    expect(
      fieldOptionSchema.safeParse({ value: "", label: "Wind" }).success,
    ).toBe(false);
  });

  it("rejects empty label", () => {
    expect(
      fieldOptionSchema.safeParse({ value: "wind", label: "" }).success,
    ).toBe(false);
  });

  it("rejects invalid imageUrl", () => {
    expect(
      fieldOptionSchema.safeParse({
        value: "wind",
        label: "Wind",
        imageUrl: "not-a-url",
      }).success,
    ).toBe(false);
  });
});

// ─── conditionalLogicSchema ──────────────────────────────────────────────────

describe("conditionalLogicSchema", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts valid show logic", () => {
    const result = conditionalLogicSchema.safeParse({
      action: "show",
      conditions: [
        { fieldId: validUuid, operator: "equals", value: "naruto" },
      ],
      logicOperator: "and",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid hide logic", () => {
    const result = conditionalLogicSchema.safeParse({
      action: "hide",
      conditions: [
        { fieldId: validUuid, operator: "is_empty" },
      ],
      logicOperator: "or",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all operator types", () => {
    const operators = ["equals", "not_equals", "contains", "is_empty", "is_not_empty"];
    for (const operator of operators) {
      const result = conditionalLogicSchema.safeParse({
        action: "show",
        conditions: [{ fieldId: validUuid, operator }],
        logicOperator: "and",
      });
      expect(result.success, `operator '${operator}' should be valid`).toBe(true);
    }
  });

  it("accepts null (nullable)", () => {
    expect(conditionalLogicSchema.safeParse(null).success).toBe(true);
  });

  it("accepts undefined (optional)", () => {
    expect(conditionalLogicSchema.safeParse(undefined).success).toBe(true);
  });

  it("rejects invalid action", () => {
    expect(
      conditionalLogicSchema.safeParse({
        action: "maybe",
        conditions: [],
        logicOperator: "and",
      }).success,
    ).toBe(false);
  });

  it("rejects non-uuid fieldId in conditions", () => {
    expect(
      conditionalLogicSchema.safeParse({
        action: "show",
        conditions: [{ fieldId: "not-a-uuid", operator: "equals" }],
        logicOperator: "and",
      }).success,
    ).toBe(false);
  });
});

// ─── formSettingsSchema ──────────────────────────────────────────────────────

describe("formSettingsSchema", () => {
  it("accepts empty object", () => {
    expect(formSettingsSchema.safeParse({}).success).toBe(true);
  });

  it("accepts all boolean flags", () => {
    expect(
      formSettingsSchema.safeParse({
        showProgressBar: true,
        shuffleFields: false,
        oneResponsePerIp: true,
        requireAuth: false,
      }).success,
    ).toBe(true);
  });

  it("accepts passwordHash string", () => {
    expect(
      formSettingsSchema.safeParse({
        passwordHash: "abc123hexhash",
      }).success,
    ).toBe(true);
  });

  it("defaults to empty object when undefined", () => {
    const result = formSettingsSchema.safeParse(undefined);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({});
  });
});

// ─── createFormSchema ────────────────────────────────────────────────────────

describe("createFormSchema", () => {
  const minimal = { title: "Chunin Exam Form" };

  it("accepts minimal valid input", () => {
    expect(createFormSchema.safeParse(minimal).success).toBe(true);
  });

  it("accepts full valid input", () => {
    const result = createFormSchema.safeParse({
      title: "S-Rank Mission Briefing",
      description: "Top secret objectives for the Anbu.",
      slug: "s-rank-mission",
      visibility: "public",
      collectEmail: true,
      successMessage: "Mission received. Await orders.",
      maxResponses: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    expect(createFormSchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects title exceeding 255 chars", () => {
    expect(
      createFormSchema.safeParse({ title: "A".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects invalid slug — uppercase", () => {
    expect(
      createFormSchema.safeParse({ title: "T", slug: "Has-Uppercase" }).success,
    ).toBe(false);
  });

  it("rejects invalid slug — spaces", () => {
    expect(
      createFormSchema.safeParse({ title: "T", slug: "has spaces" }).success,
    ).toBe(false);
  });

  it("accepts valid slug", () => {
    expect(
      createFormSchema.safeParse({ title: "T", slug: "valid-slug-123" }).success,
    ).toBe(true);
  });

  it("rejects invalid visibility", () => {
    expect(
      createFormSchema.safeParse({ title: "T", visibility: "private" }).success,
    ).toBe(false);
  });

  it("accepts public visibility", () => {
    expect(
      createFormSchema.safeParse({ title: "T", visibility: "public" }).success,
    ).toBe(true);
  });

  it("accepts null maxResponses", () => {
    expect(
      createFormSchema.safeParse({ title: "T", maxResponses: null }).success,
    ).toBe(true);
  });

  it("rejects negative maxResponses", () => {
    expect(
      createFormSchema.safeParse({ title: "T", maxResponses: -5 }).success,
    ).toBe(false);
  });

  it("rejects zero maxResponses", () => {
    expect(
      createFormSchema.safeParse({ title: "T", maxResponses: 0 }).success,
    ).toBe(false);
  });

  it("coerces closesAt string to Date", () => {
    const result = createFormSchema.safeParse({
      title: "T",
      closesAt: "2099-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
    expect(result.data?.closesAt).toBeInstanceOf(Date);
  });

  it("accepts null closesAt", () => {
    const result = createFormSchema.safeParse({ title: "T", closesAt: null });
    expect(result.success).toBe(true);
    expect(result.data?.closesAt).toBeNull();
  });
});

// ─── updateFormSchema ────────────────────────────────────────────────────────

describe("updateFormSchema", () => {
  it("accepts empty object (all fields optional)", () => {
    expect(updateFormSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial title update", () => {
    expect(updateFormSchema.safeParse({ title: "New Title" }).success).toBe(true);
  });

  it("still validates title length", () => {
    expect(
      updateFormSchema.safeParse({ title: "A".repeat(256) }).success,
    ).toBe(false);
  });
});

// ─── createFieldSchema ────────────────────────────────────────────────────────

describe("createFieldSchema", () => {
  const base = { type: "short_text" as const, label: "Ninja Name" };

  it("accepts minimal field", () => {
    expect(createFieldSchema.safeParse(base).success).toBe(true);
  });

  it("required defaults to false", () => {
    const result = createFieldSchema.safeParse(base);
    expect(result.success).toBe(true);
    expect(result.data?.required).toBe(false);
  });

  it("validations defaults to {}", () => {
    const result = createFieldSchema.safeParse(base);
    expect(result.success).toBe(true);
    expect(result.data?.validations).toEqual({});
  });

  it("accepts full field with options", () => {
    expect(
      createFieldSchema.safeParse({
        type: "select",
        label: "Chakra Nature",
        options: [
          { value: "wind", label: "Wind Release" },
          { value: "fire", label: "Fire Release" },
        ],
        required: true,
      }).success,
    ).toBe(true);
  });

  it("accepts scale field with range labels", () => {
    expect(
      createFieldSchema.safeParse({
        type: "scale",
        label: "Chakra Level",
        minValue: 1,
        maxValue: 10,
        minLabel: "Genin",
        maxLabel: "Hokage",
      }).success,
    ).toBe(true);
  });

  it("rejects empty label", () => {
    expect(createFieldSchema.safeParse({ type: "email", label: "" }).success).toBe(false);
  });

  it("rejects label exceeding 500 chars", () => {
    expect(
      createFieldSchema.safeParse({ type: "email", label: "X".repeat(501) }).success,
    ).toBe(false);
  });

  it("rejects invalid type", () => {
    expect(createFieldSchema.safeParse({ type: "image", label: "Photo" }).success).toBe(false);
  });
});

// ─── updateFieldSchema ───────────────────────────────────────────────────────

describe("updateFieldSchema", () => {
  it("accepts empty object", () => {
    expect(updateFieldSchema.safeParse({}).success).toBe(true);
  });

  it("accepts partial patch", () => {
    expect(updateFieldSchema.safeParse({ required: true }).success).toBe(true);
  });
});

// ─── reorderFieldSchema ──────────────────────────────────────────────────────

describe("reorderFieldSchema", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts valid input", () => {
    expect(
      reorderFieldSchema.safeParse({ fieldId: validUuid, newOrder: 0 }).success,
    ).toBe(true);
  });

  it("rejects negative newOrder", () => {
    expect(
      reorderFieldSchema.safeParse({ fieldId: validUuid, newOrder: -1 }).success,
    ).toBe(false);
  });

  it("rejects non-uuid fieldId", () => {
    expect(
      reorderFieldSchema.safeParse({ fieldId: "not-a-uuid", newOrder: 2 }).success,
    ).toBe(false);
  });

  it("rejects float newOrder", () => {
    expect(
      reorderFieldSchema.safeParse({ fieldId: validUuid, newOrder: 1.5 }).success,
    ).toBe(false);
  });
});

// ─── answerValueSchema ───────────────────────────────────────────────────────

describe("answerValueSchema", () => {
  it("accepts string", () => {
    expect(answerValueSchema.safeParse("Naruto Uzumaki").success).toBe(true);
  });

  it("accepts number", () => {
    expect(answerValueSchema.safeParse(42).success).toBe(true);
  });

  it("accepts boolean true", () => {
    expect(answerValueSchema.safeParse(true).success).toBe(true);
  });

  it("accepts boolean false", () => {
    expect(answerValueSchema.safeParse(false).success).toBe(true);
  });

  it("accepts string array", () => {
    expect(answerValueSchema.safeParse(["wind", "fire"]).success).toBe(true);
  });

  it("accepts null", () => {
    expect(answerValueSchema.safeParse(null).success).toBe(true);
  });

  it("rejects plain object", () => {
    expect(answerValueSchema.safeParse({ key: "val" }).success).toBe(false);
  });

  it("rejects undefined", () => {
    expect(answerValueSchema.safeParse(undefined).success).toBe(false);
  });
});

// ─── submitResponseSchema ────────────────────────────────────────────────────

describe("submitResponseSchema", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";
  const minimalValid = {
    slug: "chunin-exam",
    answers: [{ fieldId: validUuid, value: "Naruto" }],
  };

  it("accepts minimal valid submission", () => {
    expect(submitResponseSchema.safeParse(minimalValid).success).toBe(true);
  });

  it("accepts full submission with all optional fields", () => {
    expect(
      submitResponseSchema.safeParse({
        slug: "chunin-exam",
        respondentEmail: "naruto@konoha.gov",
        completionTimeMs: 15000,
        metadata: {
          referer: "https://konoha.gov",
          utmSource: "village-board",
          utmMedium: "scroll",
          utmCampaign: "chunin-2024",
        },
        answers: [
          { fieldId: validUuid, value: "Naruto Uzumaki" },
          { fieldId: "223e4567-e89b-12d3-a456-426614174000", value: 5 },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects empty slug", () => {
    expect(
      submitResponseSchema.safeParse({ slug: "", answers: [{ fieldId: validUuid, value: "x" }] }).success,
    ).toBe(false);
  });

  it("rejects empty answers array", () => {
    expect(
      submitResponseSchema.safeParse({ slug: "test", answers: [] }).success,
    ).toBe(false);
  });

  it("rejects non-uuid fieldId in answers", () => {
    expect(
      submitResponseSchema.safeParse({
        slug: "test",
        answers: [{ fieldId: "not-uuid", value: "x" }],
      }).success,
    ).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(
      submitResponseSchema.safeParse({
        slug: "test",
        respondentEmail: "not-an-email",
        answers: [{ fieldId: validUuid, value: "x" }],
      }).success,
    ).toBe(false);
  });

  it("rejects negative completionTimeMs", () => {
    expect(
      submitResponseSchema.safeParse({
        slug: "test",
        completionTimeMs: -100,
        answers: [{ fieldId: validUuid, value: "x" }],
      }).success,
    ).toBe(false);
  });
});

// ─── trackEventSchema ────────────────────────────────────────────────────────

describe("trackEventSchema", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts view event", () => {
    expect(
      trackEventSchema.safeParse({ formId: validUuid, event: "view" }).success,
    ).toBe(true);
  });

  it("accepts start event with durationMs", () => {
    expect(
      trackEventSchema.safeParse({
        formId: validUuid,
        event: "start",
        durationMs: 5000,
      }).success,
    ).toBe(true);
  });

  it("accepts abandon event with referrer", () => {
    expect(
      trackEventSchema.safeParse({
        formId: validUuid,
        event: "abandon",
        referrer: "https://google.com",
      }).success,
    ).toBe(true);
  });

  it("rejects submit event (not allowed in trackEventSchema)", () => {
    expect(
      trackEventSchema.safeParse({ formId: validUuid, event: "submit" }).success,
    ).toBe(false);
  });

  it("rejects non-uuid formId", () => {
    expect(
      trackEventSchema.safeParse({ formId: "not-uuid", event: "view" }).success,
    ).toBe(false);
  });

  it("rejects negative durationMs", () => {
    expect(
      trackEventSchema.safeParse({
        formId: validUuid,
        event: "start",
        durationMs: -1,
      }).success,
    ).toBe(false);
  });
});

// ─── paginationSchema ────────────────────────────────────────────────────────

describe("paginationSchema", () => {
  it("defaults page to 1 when not provided", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.page).toBe(1);
  });

  it("defaults pageSize to 20 when not provided", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.pageSize).toBe(20);
  });

  it("accepts page=5 pageSize=50", () => {
    expect(paginationSchema.safeParse({ page: 5, pageSize: 50 }).success).toBe(true);
  });

  it("rejects page=0", () => {
    expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects page=-1", () => {
    expect(paginationSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("rejects pageSize=0", () => {
    expect(paginationSchema.safeParse({ pageSize: 0 }).success).toBe(false);
  });

  it("rejects pageSize=101 (exceeds max)", () => {
    expect(paginationSchema.safeParse({ pageSize: 101 }).success).toBe(false);
  });

  it("accepts pageSize=100 (max allowed)", () => {
    expect(paginationSchema.safeParse({ pageSize: 100 }).success).toBe(true);
  });

  it("accepts pageSize=1 (min allowed)", () => {
    expect(paginationSchema.safeParse({ pageSize: 1 }).success).toBe(true);
  });
});
