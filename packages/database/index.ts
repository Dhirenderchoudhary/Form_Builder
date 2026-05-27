import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { env } from "./env";
import * as schema from "./schema";

export const db: NodePgDatabase<typeof schema> = drizzle(env.DATABASE_URL, { schema });

export * from "drizzle-orm";
export * from "./schema";
export type { NodePgDatabase } from "drizzle-orm/node-postgres";
export default db;
