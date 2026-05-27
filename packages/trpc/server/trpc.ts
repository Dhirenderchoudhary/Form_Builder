import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";
import type { Context } from "./context";
import UserService from "@repo/services/user";

const userService = new UserService();

export const tRPCContext = initTRPC
  .meta<OpenApiMeta>()
  .context<Context>()
  .create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

export const protectedProcedure = tRPCContext.procedure.use(async ({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to access this resource",
    });
  }

  // Use the cached dbUser if available, otherwise fetch from database
  // @ts-ignore — dbUser is an optional cached property on context
  const user = ctx.auth.dbUser || await userService.getUserByClerkId(ctx.auth.userId);
  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found. Sign in once so the account is provisioned.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: {
        userId: user.id,
        clerkId: ctx.auth.userId,
        dbUser: user,
      },
    },
  });
});
