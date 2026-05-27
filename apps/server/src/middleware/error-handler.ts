import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "@repo/logger";
import { ApiError } from "../lib/api-error.js";
import { ApiResponse } from "../lib/api-response.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    logger.warn("API error", {
      code: err.code,
      message: err.message,
      method: req.method,
      path: req.path,
    });
    ApiResponse.error(res, err);
    return;
  }

  if (err instanceof ZodError) {
    const apiErr = ApiError.unprocessable("Validation failed", err.flatten());
    logger.warn("Validation error", { path: req.path, issues: err.issues });
    ApiResponse.error(res, apiErr);
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  logger.error("Unhandled error", {
    message,
    stack: err instanceof Error ? err.stack : undefined,
    method: req.method,
    path: req.path,
  });

  ApiResponse.error(res, ApiError.internal());
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.path}`));
}
