import type { Request, Response, NextFunction } from "express";
import { Webhook } from "svix";
import { logger } from "@repo/logger";
import UserService from "@repo/services/user";
import { ApiError } from "../lib/api-error.js";
import { ApiResponse } from "../lib/api-response.js";
import { env } from "../env.js";

const userService = new UserService();

interface ClerkUserPayload {
  id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  email_addresses: Array<{ id: string; email_address: string }>;
  primary_email_address_id: string;
}

function buildFullName(first: string | null, last: string | null): string | null {
  return [first, last].filter(Boolean).join(" ") || null;
}

export async function handleClerkWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return next(ApiError.internal("Webhook secret not configured"));
  }

  const svixId = req.headers["svix-id"] as string | undefined;
  const svixTimestamp = req.headers["svix-timestamp"] as string | undefined;
  const svixSignature = req.headers["svix-signature"] as string | undefined;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return next(ApiError.badRequest("Missing svix signature headers"));
  }

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event: { type: string; data: ClerkUserPayload };

  try {
    event = wh.verify(req.body as string, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch (err) {
    logger.warn("Clerk webhook signature verification failed", { error: err });
    return next(ApiError.unauthorized("Webhook signature verification failed"));
  }

  const { type, data } = event;
  logger.info("Clerk webhook received", { type, clerkId: data.id });

  try {
    if (type === "user.created" || type === "user.updated") {
      const primaryEmail = data.email_addresses.find(
        (e) => e.id === data.primary_email_address_id,
      );

      if (!primaryEmail) {
        return next(ApiError.badRequest("No primary email found in Clerk payload"));
      }

      await userService.upsertUser({
        clerkId: data.id,
        fullName: buildFullName(data.first_name, data.last_name),
        email: primaryEmail.email_address,
        profileImageUrl: data.image_url,
      });

      logger.info(`User ${type === "user.created" ? "created" : "updated"} in DB`, {
        clerkId: data.id,
      });
    }

    if (type === "user.deleted") {
      await userService.deleteUserByClerkId(data.id);
      logger.info("User deleted from DB", { clerkId: data.id });
    }

    ApiResponse.ok(res, { received: true });
  } catch (err) {
    logger.error("Clerk webhook handler error", { type, error: err });
    next(ApiError.internal("Failed to process webhook event"));
  }
}
