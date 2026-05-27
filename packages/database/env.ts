import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().describe("DB connection URL"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;


export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    if (!_env) {
      const envData = {
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
      };
      const result = envSchema.safeParse(envData);
      if (!result.success) throw new Error(result.error.message);
      _env = result.data;
    }
    return _env[prop as keyof Env];
  },
});

