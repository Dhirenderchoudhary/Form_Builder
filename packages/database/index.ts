
import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { env } from "./env";
import * as schema from "./schema";

type DB = NodePgDatabase<typeof schema>;

let _db: DB | undefined;


function getDb(): DB {
  if (!_db) {
    _db = drizzle(env.DATABASE_URL, { schema });
  }
  return _db;
}


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
