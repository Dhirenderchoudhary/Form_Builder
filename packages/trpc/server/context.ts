export type BaseContextInput = {
  userId: string | null;
  dbUser?: any | null;
  requestId?: string;
  ipAddress?: string;
};

export function createBaseContext(input: BaseContextInput) {
  return {
    auth: {
      userId: input.userId,
      clerkId: input.userId,
      dbUser: input.dbUser ?? null,
    },
    requestId: input.requestId ?? "unknown",
    ipAddress: input.ipAddress,
  };
}

export type Context = ReturnType<typeof createBaseContext>;

