import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().describe("DB connection URL"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

/**
 * Lazily validate and return env vars.
 * Deferred so the module can be imported at build-time (e.g. Next.js
 * static analysis) without crashing when DATABASE_URL is absent.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    if (!_env) {
      const result = envSchema.safeParse(process.env);
      if (!result.success) throw new Error(result.error.message);
      _env = result.data;
    }
    return _env[prop as keyof Env];
  },
});

