import helmet from "helmet";
import rateLimit, { ipKeyGenerator, type Options as RateLimitOptions } from "express-rate-limit";
import compression from "compression";
import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "@repo/logger";

export const helmetMiddleware = helmet({

  contentSecurityPolicy: false,

  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
  level: 6,
});

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId =
    (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logFn =
      res.statusCode >= 500
        ? logger.error.bind(logger)
        : res.statusCode >= 400
          ? logger.warn.bind(logger)
          : logger.info.bind(logger);

    logFn("HTTP", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.requestId,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  });

  next();
}

function createRateLimiter(overrides: Partial<RateLimitOptions>) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please slow down and try again later.",
      },
    },
    handler: (req, res, _next, options) => {
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        path: req.path,
        requestId: req.requestId,
      });
      res.status(429).json(options.message);
    },
    ...overrides,
  });
}

export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
});

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
});

export const submissionRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => {
    const formId =
      (req.params["formId"] as string | undefined) ??
      (req.body as Record<string, unknown>)?.formId ??
      "unknown";
    return `${ipKeyGenerator(req.ip ?? "unknown")}:${formId}`;
  },
});

export const viewRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "unknown"),
});
