import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

/* Strip params unsupported by node-postgres (e.g. channel_binding) */
function sanitizeDbUrl(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return url;
  }
}

/* Database is optional — if DATABASE_URL is not set the app runs without it */
export let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
export let pool: pg.Pool | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: sanitizeDbUrl(process.env.DATABASE_URL) });
  db   = drizzle(pool, { schema });
}

export * from "./schema";
