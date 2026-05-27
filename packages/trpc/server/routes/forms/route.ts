import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService, responseService, analyticsService } from "../../services";
import {
  createFormSchema,
  updateFormSchema,
  uuidSchema,
  paginationSchema,
  createFieldSchema,
  updateFieldSchema,
  reorderFieldSchema,
} from "../../schemas/form.schemas";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

export const formsRouter = router({

  list: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/"),
        tags: TAGS,
        summary: "List all forms for the authenticated creator",
        protect: true,
      },
    })
    .input(z.undefined())
    .output(z.any())
    .query(async ({ ctx }) => {
      return formService.getFormsByUser(ctx.auth.userId);
    }),

  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/"),
        tags: TAGS,
        summary: "Create a new form",
        protect: true,
      },
    })
    .input(createFormSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return formService.createForm(ctx.auth.userId, input);
    }),

  get: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}"),
        tags: TAGS,
        summary: "Get a form with all its fields",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      return formService.getFormById(input.formId, ctx.auth.userId);
    }),

  update: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/{formId}"),
        tags: TAGS,
        summary: "Update form details",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema }).merge(updateFormSchema))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { formId, ...data } = input;
      return formService.updateForm(formId, ctx.auth.userId, data);
    }),

  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/{formId}"),
        tags: TAGS,
        summary: "Archive (soft-delete) a form",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await formService.deleteForm(input.formId, ctx.auth.userId);
      return { success: true };
    }),

  publish: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/{formId}/publish"),
        tags: TAGS,
        summary: "Publish a form and make it accessible to respondents",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return formService.publishForm(input.formId, ctx.auth.userId);
    }),

  unpublish: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/{formId}/unpublish"),
        tags: TAGS,
        summary: "Unpublish (close) a form — no new responses accepted",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return formService.unpublishForm(input.formId, ctx.auth.userId);
    }),

  setPassword: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/{formId}/password"),
        tags: TAGS,
        summary: "Set or clear a form's access password",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: uuidSchema,
        // null clears the password
        password: z.string().min(4).max(200).nullable(),
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return formService.setFormPassword(input.formId, ctx.auth.userId, input.password);
    }),

  addField: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/{formId}/fields"),
        tags: TAGS,
        summary: "Add a field to a form",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema }).merge(createFieldSchema))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { formId, ...fieldData } = input;
      return formService.addField(formId, ctx.auth.userId, fieldData);
    }),

  updateField: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/{formId}/fields/{fieldId}"),
        tags: TAGS,
        summary: "Update a form field",
        protect: true,
      },
    })
    .input(
      z
        .object({ formId: uuidSchema, fieldId: uuidSchema })
        .merge(updateFieldSchema),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { fieldId, formId: _formId, ...data } = input;
      return formService.updateField(fieldId, ctx.auth.userId, data);
    }),

  deleteField: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/{formId}/fields/{fieldId}"),
        tags: TAGS,
        summary: "Delete a form field",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema, fieldId: uuidSchema }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await formService.deleteField(input.fieldId, ctx.auth.userId);
      return { success: true };
    }),

  reorderField: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/{formId}/fields/reorder"),
        tags: TAGS,
        summary: "Reorder a field within a form",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema }).merge(reorderFieldSchema))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      return formService.reorderField(input.fieldId, ctx.auth.userId, input.newOrder);
    }),

  listResponses: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/responses"),
        tags: ["Responses"],
        summary: "List all responses for a form (creator only)",
        protect: true,
      },
    })
    .input(
      z.object({ formId: uuidSchema }).merge(
        paginationSchema.merge(
          z.object({
            from: z.string().datetime().optional(),
            to: z.string().datetime().optional(),
          }),
        ),
      ),
    )
    .output(z.any())
    .query(async ({ ctx, input }) => {

      await formService.getFormById(input.formId, ctx.auth.userId);

      const { formId, page, pageSize, from, to } = input;
      return responseService.getFormResponses(formId, {
        page,
        pageSize,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
      });
    }),

  getResponse: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/responses/{responseId}"),
        tags: ["Responses"],
        summary: "Get a single response with all its answers",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema, responseId: uuidSchema }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      await formService.getFormById(input.formId, ctx.auth.userId);
      return responseService.getResponseById(input.responseId);
    }),

  deleteResponse: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/{formId}/responses/{responseId}"),
        tags: ["Responses"],
        summary: "Delete a specific response",
        protect: true,
      },
    })
    .input(z.object({ formId: uuidSchema, responseId: uuidSchema }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await formService.getFormById(input.formId, ctx.auth.userId);
      await responseService.deleteResponse(input.responseId);
      return { success: true };
    }),

  analytics: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/analytics"),
        tags: ["Analytics"],
        summary: "Get analytics summary for a form",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: uuidSchema,
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      }),
    )
    .output(z.any())
    .query(async ({ ctx, input }) => {

      await formService.getFormById(input.formId, ctx.auth.userId);
      return analyticsService.getFormAnalytics(input.formId, {
        from: input.from ? new Date(input.from) : undefined,
        to: input.to ? new Date(input.to) : undefined,
      });
    }),
});
