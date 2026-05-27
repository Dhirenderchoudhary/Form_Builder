import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { serverRouter, createBaseContext } from "@repo/trpc/server";
import UserService from "@repo/services/user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const userService = new UserService();

async function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: "/api/backend",
    req: request,
    router: serverRouter,
    createContext: async () => {
      const { userId: clerkId } = await auth();

      if (clerkId) {
        const existingUser = await userService.getUserByClerkId(clerkId);

        if (!existingUser) {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(clerkId);
          const primaryEmail =
            clerkUser.emailAddresses.find(
              (email) => email.id === clerkUser.primaryEmailAddressId
            ) ?? clerkUser.emailAddresses[0];

          if (primaryEmail) {
            await userService.upsertUser({
              clerkId,
              fullName:
                [clerkUser.firstName, clerkUser.lastName]
                  .filter(Boolean)
                  .join(" ") || null,
              email: primaryEmail.emailAddress,
              profileImageUrl: clerkUser.imageUrl,
            });
          }
        }
      }

      return createBaseContext({
        userId: clerkId ?? null,
        requestId: crypto.randomUUID(),
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown",
      });
    },
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
};
