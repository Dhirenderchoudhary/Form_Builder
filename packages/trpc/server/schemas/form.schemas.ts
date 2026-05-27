import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const fieldTypeSchema = z.enum([
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
]);

export const fieldValidationsSchema = z
  .object({
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().positive().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    patternMessage: z.string().optional(),
  })
  .default({});

export const fieldOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  imageUrl: z.string().url().optional(),
});

export const formSettingsSchema = z
  .object({
    showProgressBar: z.boolean().optional(),
    shuffleFields: z.boolean().optional(),
    oneResponsePerIp: z.boolean().optional(),
    requireAuth: z.boolean().optional(),
    passwordHash: z.string().optional(),
  })
  .default({});

export const createFormSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  visibility: z.enum(["public", "unlisted"]).default("unlisted"),
  themeId: uuidSchema.optional(),
  settings: formSettingsSchema,
  collectEmail: z.boolean().default(false),
  successMessage: z.string().max(1000).optional(),
  redirectUrl: z.string().url().optional(),
  maxResponses: z.number().int().positive().optional(),
  closesAt: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
});

export const updateFormSchema = createFormSchema.partial();

export const createFieldSchema = z.object({
  type: fieldTypeSchema,
  label: z.string().min(1).max(500),
  placeholder: z.string().max(500).optional(),
  helpText: z.string().max(1000).optional(),
  required: z.boolean().default(false),
  validations: fieldValidationsSchema,
  options: z.array(fieldOptionSchema).optional(),
  minValue: z.number().int().optional(),
  maxValue: z.number().int().optional(),
  minLabel: z.string().max(100).optional(),
  maxLabel: z.string().max(100).optional(),
});

export const updateFieldSchema = createFieldSchema.partial();

export const reorderFieldSchema = z.object({
  fieldId: uuidSchema,
  newOrder: z.number().int().nonnegative(),
});

export const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
]);

export const submitResponseSchema = z.object({
  slug: z.string().min(1),
  respondentEmail: z.string().email().optional(),
  completionTimeMs: z.number().int().nonnegative().optional(),
  metadata: z
    .object({
      referer: z.string().optional(),
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
    })
    .optional(),
  answers: z
    .array(
      z.object({
        fieldId: uuidSchema,
        value: answerValueSchema,
      }),
    )
    .min(1),
});

export const trackEventSchema = z.object({
  formId: uuidSchema,
  event: z.enum(["view", "start", "abandon"]),
  durationMs: z.number().int().nonnegative().optional(),
  referrer: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
  to: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
});
