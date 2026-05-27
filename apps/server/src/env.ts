import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BASE_URL: z.string().default("http://localhost:8000"),

  CLERK_SECRET_KEY: z.string().startsWith("sk_"),
  CLERK_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  CLERK_PUBLISHABLE_KEY: z.string(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default("noreply@formbuilder.dev"),

  APP_NAME: z.string().default("FormCraft"),
  WEB_URL: z.string().default("http://localhost:3000"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const result = envSchema.safeParse(env);
  if (!result.success) throw new Error(result.error.message);
  return result.data;
}

export const env = createEnv(process.env);
