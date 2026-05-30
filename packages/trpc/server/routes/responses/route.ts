import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService, responseService } from "../../services";
import { uuidSchema, paginationSchema } from "../../schemas/form.schemas";

const TAGS = ["Responses"];
const getPath = generatePath("/responses");

export const responsesRouter = router({
  list: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}"),
        tags: TAGS,
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

  get: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/{responseId}"),
        tags: TAGS,
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

  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/{formId}/{responseId}"),
        tags: TAGS,
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
});
