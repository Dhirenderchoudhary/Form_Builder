import { TRPCError } from "@trpc/server";

export abstract class BaseService {
  protected notFound(resource: string): never {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `${resource} not found`,
    });
  }

  protected forbidden(message = "You do not have permission to perform this action"): never {
    throw new TRPCError({ code: "FORBIDDEN", message });
  }

  protected badRequest(message: string): never {
    throw new TRPCError({ code: "BAD_REQUEST", message });
  }

  protected conflict(message: string): never {
    throw new TRPCError({ code: "CONFLICT", message });
  }

  protected internal(message = "An unexpected error occurred"): never {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
  }
}
