import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../trpc";
import { zodUndefinedModel } from "../../schema";
import { generatePath } from "../../utils/path-generator";
import { getMeOutputModel } from "./model";
import { userService } from "../../services";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  getMe: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/me"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(getMeOutputModel)
    .query(async ({ ctx }) => {
      const user = await userService.getUserByClerkId(ctx.auth.userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found — webhook may not have fired yet",
        });
      }
      return user;
    }),
});
