export type BaseContextInput = {
  userId: string | null;
  requestId?: string;
  ipAddress?: string;
};

export function createBaseContext(input: BaseContextInput) {
  return {
    auth: {

      userId: input.userId,
      clerkId: input.userId,
    },
    requestId: input.requestId ?? "unknown",
    ipAddress: input.ipAddress,
  };
}

export type Context = ReturnType<typeof createBaseContext>;
