import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
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
      // 1. Fast-path: bypass Clerk auth and DB for health check pings to avoid latency and failures
      if (request.url.includes("health.check") || request.url.includes("/health")) {
        return createBaseContext({
          userId: null,
          dbUser: null,
          requestId: crypto.randomUUID(),
          ipAddress:
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            "unknown",
        });
      }

      let { userId: clerkId } = await auth();
      
      // If there's no Clerk user, check if we have a valid sandboxed demo session cookie
      if (!clerkId) {
        const cookieStore = await cookies();
        if (cookieStore.get("demo_session")?.value === "true") {
          clerkId = "clerk_demo_shinobi";
        }
      }

      let dbUser = null;

      if (clerkId) {
        let existingUser = await userService.getUserByClerkId(clerkId);

        if (!existingUser) {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(clerkId);
          const primaryEmail =
            clerkUser.emailAddresses.find(
              (email) => email.id === clerkUser.primaryEmailAddressId
            ) ?? clerkUser.emailAddresses[0];

          if (primaryEmail) {
            existingUser = await userService.upsertUser({
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
        dbUser = existingUser;
      }

      return createBaseContext({
        userId: clerkId ?? null,
        dbUser,
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
