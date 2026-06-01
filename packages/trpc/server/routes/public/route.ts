import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Client as QStashClient } from "@upstash/qstash";
import { router, publicProcedure } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { formService, responseService, analyticsService, userService } from "../../services";
import { submitResponseSchema, trackEventSchema } from "../../schemas/form.schemas";
import EmailService from "@repo/services/email";

const TAGS = ["Public"];
const getPath = generatePath("/public");

// Initialize Upstash Redis & RateLimiter
let ratelimit: Ratelimit | null = null;
if (process.env["UPSTASH_REDIS_REST_URL"] && process.env["UPSTASH_REDIS_REST_TOKEN"]) {
  const redis = new Redis({
    url: process.env["UPSTASH_REDIS_REST_URL"],
    token: process.env["UPSTASH_REDIS_REST_TOKEN"],
  });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
  });
}

// Initialize QStash Client
let qstashClient: QStashClient | null = null;
if (process.env["QSTASH_TOKEN"]) {
  qstashClient = new QStashClient({ token: process.env["QSTASH_TOKEN"] });
}

export const publicRouter = router({

  getForm: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/forms/{slug}"),
        tags: TAGS,
        summary: "Get a published form by its slug (no auth required)",
      },
    })
    .input(
      z.object({
        slug: z.string().min(1),
        password: z.string().optional(),
      }),
    )
    .output(z.any())
    .query(async ({ input }) => {
      let form: Awaited<ReturnType<typeof formService.getPublicFormBySlug>>;
      try {
        form = await formService.getPublicFormBySlug(input.slug);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err) {
          const e = err as { code: string; message: string };
          if (e.code === "FORM_CLOSED" || e.code === "FORM_EXPIRED" || e.code === "FORM_FULL") {
            throw new TRPCError({ code: "FORBIDDEN", message: e.message });
          }
        }
        throw err;
      }

      const passwordHash = form.settings?.passwordHash;
      if (passwordHash) {
        let isMatch = false;
        if (input.password) {
          isMatch = await bcrypt.compare(input.password, passwordHash);
        }
        if (!isMatch) {
          // Return a slim "locked" payload — no fields, no description.
          return {
            id: form.id,
            slug: form.slug,
            title: form.title,
            passwordRequired: true as const,
          };
        }
      }

      return form;
    }),

  verifyPassword: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/forms/{slug}/verify"),
        tags: TAGS,
        summary: "Verify a form's password and unlock it",
      },
    })
    .input(z.object({ slug: z.string().min(1), password: z.string().min(1) }))
    .output(z.object({ ok: z.boolean() }))
    .mutation(async ({ input }) => {
      const form = await formService.getPublicFormBySlug(input.slug);
      const passwordHash = form.settings?.passwordHash;
      if (!passwordHash) return { ok: true };
      const isMatch = await bcrypt.compare(input.password, passwordHash);
      return { ok: isMatch };
    }),

  submit: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/forms/{slug}/submit"),
        tags: TAGS,
        summary: "Submit a response to a published form (no auth required)",
      },
    })
    .input(submitResponseSchema.extend({ password: z.string().optional(), _honeypot: z.string().optional() }))
    .output(z.object({ responseId: z.string().uuid(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Honeypot check: Bots will usually fill out this visually hidden field.
      // Eject early with a fake success to fool the spam bot.
      if (input._honeypot) {
        return { responseId: crypto.randomUUID(), message: "Submission successful" };
      }

      const ip = ctx.ipAddress ?? "unknown_ip";
      
      // Robust sliding-window rate limiting via Redis
      if (ratelimit) {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many submissions. Please wait a moment.",
          });
        }
      }

      let form: Awaited<ReturnType<typeof formService.getPublicFormBySlug>>;
      try {
        form = await formService.getPublicFormBySlug(input.slug);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err) {
          const e = err as { code: string; message: string };
          throw new TRPCError({ code: "FORBIDDEN", message: e.message });
        }
        throw err;
      }

      // Re-verify password on submit so the seal can't be bypassed.
      const passwordHash = form.settings?.passwordHash;
      if (passwordHash) {
        let isMatch = false;
        if (input.password) {
          isMatch = await bcrypt.compare(input.password, passwordHash);
        }
        if (!isMatch) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Insufficient chakra — wrong password.",
          });
        }
      }

      // `maxResponses` and `oneResponsePerIp` checks are now securely handled inside a 
      // database transaction within `responseService.submitResponse` to prevent race conditions.

      let response;
      try {
        response = await responseService.submitResponse({
          formId: form.id,
          respondentEmail: input.respondentEmail,
          ipAddress: ip,
          completionTimeMs: input.completionTimeMs,
          metadata: input.metadata,
          answers: input.answers,
        });
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err) {
          const e = err as { code: string; message: string };
          throw new TRPCError({ code: "FORBIDDEN", message: e.message });
        }
        throw err;
      }

      analyticsService
        .trackEvent({
          formId: form.id,
          event: "submit",
          ipAddress: ip,
          referrer: input.metadata?.referer,
        })
        .catch((err) => console.error("Failed to track submit event:", err));

      const webUrl = process.env["WEB_URL"] ?? "http://localhost:3000";
      const apiUrl = process.env["BASE_URL"] ?? "http://localhost:3001";

      if (qstashClient) {
        userService
          .getUserById(form.userId)
          .then(async (creator) => {
            if (!creator) return;
            // Publish creator notification job to QStash
            await qstashClient!.publishJSON({
              url: `${apiUrl}/api/webhooks/qstash/email`,
              body: {
                type: "new_response",
                data: {
                  creatorEmail: creator.email,
                  creatorName: creator.fullName,
                  formTitle: form.title,
                  formSlug: input.slug,
                  responseId: response.id,
                  respondentEmail: input.respondentEmail,
                  submittedAt: response.submittedAt,
                  dashboardUrl: webUrl,
                },
              },
              retries: 3,
            });
          })
          .catch((err) => console.error("Failed to enqueue creator notification", err));

        if (input.respondentEmail) {
          qstashClient.publishJSON({
            url: `${apiUrl}/api/webhooks/qstash/email`,
            body: {
              type: "respondent_confirmation",
              data: {
                respondentEmail: input.respondentEmail,
                formTitle: form.title,
                successMessage: form.successMessage ?? "Thank you for your response!",
                appName: process.env["APP_NAME"] ?? "Konoha Forms",
              },
            },
            retries: 3,
          }).catch((err) => console.error("Failed to enqueue respondent confirmation", err));
        }
      } else {
        // Fallback if no QStash is configured
        const emailService = new EmailService({
          apiKey: process.env["RESEND_API_KEY"],
          fromAddress: process.env["EMAIL_FROM"] ?? "noreply@konohaforms.app",
          appName: process.env["APP_NAME"] ?? "Konoha Forms",
        });
        userService
          .getUserById(form.userId)
          .then(async (creator) => {
            if (!creator) return;
            return emailService.sendNewResponseNotification({
              creatorEmail: creator.email,
              creatorName: creator.fullName,
              formTitle: form.title,
              formSlug: input.slug,
              responseId: response.id,
              respondentEmail: input.respondentEmail,
              submittedAt: response.submittedAt,
              dashboardUrl: webUrl,
            });
          })
          .catch((err) => console.error("Email notification fallback failed", err));
          
        if (input.respondentEmail) {
          emailService
            .sendRespondentConfirmation({
              respondentEmail: input.respondentEmail,
              formTitle: form.title,
              successMessage: form.successMessage ?? "Thank you for your response!",
              appName: process.env["APP_NAME"] ?? "Konoha Forms",
            })
            .catch((err) => console.error("Email confirmation fallback failed", err));
        }
      }

      return {
        responseId: response.id,
        message: form.successMessage ?? "Thank you for your response!",
      };
    }),

  trackEvent: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/analytics/track"),
        tags: TAGS,
        summary: "Track a form interaction event (view, start, abandon)",
      },
    })
    .input(trackEventSchema)
    .output(z.object({ tracked: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await analyticsService.trackEvent({
        formId: input.formId,
        event: input.event,
        ipAddress: ctx.ipAddress,
        durationMs: input.durationMs,
        referrer: input.referrer,
      });
      return { tracked: true };
    }),
});
