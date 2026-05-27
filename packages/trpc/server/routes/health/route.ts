import { z } from "zod";
import { publicProcedure, router } from "../../trpc";
import { zodUndefinedModel } from "../../schema";

export const healthRouter = router({
  check: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/health",
        tags: ["Health"],
        summary: "Check API health status",
      },
    })
    .input(zodUndefinedModel)
    .output(
      z.object({
        status: z.literal("healthy"),
        timestamp: z.string(),
        uptime: z.number().describe("Process uptime in seconds"),
      }),
    )
    .query(() => ({
      status: "healthy" as const,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    })),
});
