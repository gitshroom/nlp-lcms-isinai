import { Pool } from "pg";

// Reuse a single pool across hot reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var _isinaiPgPool: Pool | undefined;
}

export const pool =
  global._isinaiPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global._isinaiPgPool = pool;
}