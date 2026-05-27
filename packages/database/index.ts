
import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { env } from "./env";
import * as schema from "./schema";

type DB = NodePgDatabase<typeof schema>;

let _db: DB | undefined;

/**
 * Lazily create the Drizzle client. Deferred so that importing this
 * module during a Next.js build (static analysis phase) doesn't crash
 * when DATABASE_URL isn't set yet.
 */
function getDb(): DB {
  if (!_db) {
    _db = drizzle(env.DATABASE_URL, { schema });
  }
  return _db;
}

/**
 * The Drizzle database client.
 * Uses a Proxy so it looks like a normal export (`db.select()...`)
 * while actually being lazily initialised.
 */
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb();
    const val = (real as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === "function" ? val.bind(real) : val;
  },
});

export * from "drizzle-orm";
export * from "./schema";
export type { NodePgDatabase } from "drizzle-orm/node-postgres";
export default db;
