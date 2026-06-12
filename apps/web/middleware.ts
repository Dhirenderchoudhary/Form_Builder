import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Check for demo session cookie to allow sandbox bypass
    const hasDemoCookie = req.cookies.get("demo_session")?.value === "true";
    if (hasDemoCookie) {
      return;
    }

    const url = new URL(req.url);
    await auth.protect({
      unauthenticatedUrl: `${url.origin}/sign-in?redirect_url=${encodeURIComponent(url.pathname + url.search)}`,
    });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
