import { router } from "./trpc";
import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { formsRouter } from "./routes/forms/route";
import { publicRouter } from "./routes/public/route";
import { exploreRouter } from "./routes/explore/route";
import { responsesRouter } from "./routes/responses/route";
import { analyticsRouter } from "./routes/analytics/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  forms: formsRouter,
  public: publicRouter,
  explore: exploreRouter,
  responses: responsesRouter,
  analytics: analyticsRouter,
});

export type ServerRouter = typeof serverRouter;

export { createBaseContext } from "./context";
export type { Context } from "./context";
