import type { Response } from "express";
import { type ApiError } from "./api-error.js";

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: ResponseMeta;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ResponseMeta;
}

interface ResponseMeta {
  timestamp: string;
}

function buildMeta(): ResponseMeta {
  return { timestamp: new Date().toISOString() };
}

export class ApiResponse {
  static ok<T>(res: Response, data: T): void {
    const body: SuccessResponse<T> = { success: true, data, meta: buildMeta() };
    res.status(200).json(body);
  }

  static created<T>(res: Response, data: T): void {
    const body: SuccessResponse<T> = { success: true, data, meta: buildMeta() };
    res.status(201).json(body);
  }

  static noContent(res: Response): void {
    res.status(204).send();
  }

  static error(res: Response, err: ApiError): void {
    const body: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined && { details: err.details }),
      },
      meta: buildMeta(),
    };
    res.status(err.statusCode).json(body);
  }
}
