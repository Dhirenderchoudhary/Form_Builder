import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService, analyticsService } from "../../services";
import { uuidSchema } from "../../schemas/form.schemas";

const TAGS = ["Analytics"];
const getPath = generatePath("/analytics");

export const analyticsRouter = router({
  get: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}"),
        tags: TAGS,
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
    
  getFieldAnalytics: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/fields"),
        tags: TAGS,
        summary: "Get per-field choice distribution analytics",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: uuidSchema,
      }),
    )
    .output(z.any())
    .query(async ({ ctx, input }) => {
      await formService.getFormById(input.formId, ctx.auth.userId);
      // We will implement this method in AnalyticsService next
      return analyticsService.getFieldAnalytics(input.formId);
    }),
});
