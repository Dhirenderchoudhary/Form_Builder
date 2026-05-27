import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().describe("DB connection URL"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const result = envSchema.safeParse(env);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
}

export const env = createEnv(process.env);
