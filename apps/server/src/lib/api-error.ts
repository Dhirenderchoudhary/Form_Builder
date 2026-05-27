export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "INTERNAL_SERVER_ERROR";

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "You must be signed in to access this resource"): ApiError {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have permission to perform this action"): ApiError {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(resource: string): ApiError {
    return new ApiError(404, "NOT_FOUND", `${resource} not found`);
  }

  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(409, "CONFLICT", message, details);
  }

  static unprocessable(message: string, details?: unknown): ApiError {
    return new ApiError(422, "UNPROCESSABLE", message, details);
  }

  static internal(message = "An unexpected error occurred"): ApiError {
    return new ApiError(500, "INTERNAL_SERVER_ERROR", message);
  }
}
