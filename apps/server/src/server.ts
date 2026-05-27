import express from "express";
import cors from "cors";
import { clerkMiddleware, getAuth } from "@clerk/express";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";

import { serverRouter, createBaseContext } from "@repo/trpc/server";
import { handleClerkWebhook } from "./webhooks/clerk.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import {
  helmetMiddleware,
  compressionMiddleware,
  requestIdMiddleware,
  requestLoggerMiddleware,
  generalRateLimit,
  authRateLimit,
  submissionRateLimit,
} from "./middleware/security.js";
import { ApiResponse } from "./lib/api-response.js";
import { env } from "./env.js";

export const app = express();

app.set("trust proxy", 1);

app.use(helmetMiddleware);

app.use(compressionMiddleware);

app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

const allowedOrigins =
  env.NODE_ENV === "development"
    ? true
    : [env.WEB_URL, env.BASE_URL];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id", "x-trpc-source"],
    exposedHeaders: ["x-request-id", "RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  }),
);

app.post(
  "/webhooks/clerk",
  express.raw({ type: "application/json" }),
  handleClerkWebhook,
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(clerkMiddleware());

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: env.APP_NAME,
  description:
    "Production-grade form builder API. Create dynamic forms, collect responses and track analytics.",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
  tags: ["forms", "fields", "responses", "analytics", "themes", "explore", "health", "auth"],
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
});

app.get("/", (_req, res) => {
  ApiResponse.ok(res, {
    service: env.APP_NAME,
    version: "1.0.0",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
});

app.get("/openapi.json", (_req, res) => {
  ApiResponse.ok(res, openApiDocument);
});

app.use("/docs", async (req, res, next) => {
  const { apiReference } = await import("@scalar/express-api-reference");
  return apiReference({
    url: "/openapi.json",
    theme: "purple",
    layout: "modern",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })(req as any, res, next);
});

const createContext = ({ req }: CreateExpressContextOptions) =>
  createBaseContext({
    userId: getAuth(req).userId ?? null,
    requestId: req.requestId,
    ipAddress: (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
      ?? req.ip
      ?? "unknown",
  });

app.use("/api", generalRateLimit);

app.use("/api/authentication", authRateLimit);

app.use("/api/public.submit", submissionRateLimit);

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/api",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
