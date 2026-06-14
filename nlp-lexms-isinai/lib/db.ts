import { Pool, type QueryResultRow } from "pg";
import {
  PART_OF_SPEECH,
  CORPUS_TYPE,
  type PartOfSpeech,
  type CorpusType,
  type CorpusOption,
  type VerifierOption,
} from "./constants";

export {
  PART_OF_SPEECH,
  CORPUS_TYPE,
  type PartOfSpeech,
  type CorpusType,
  type CorpusOption,
  type VerifierOption,
};

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

/**
 * Run a parameterized query. Always pass dynamic values via `params`
 * ($1, $2, ...) — never interpolate user input into the query string.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return pool.query<T>(text, params);
}

// ── List helpers for form dropdowns ──────────────────────────

export async function listCorpusOptions(): Promise<CorpusOption[]> {
  const result = await query<CorpusOption>(
    `SELECT corpus_id, title, filetype
     FROM corpus
     ORDER BY title ASC`
  );
  return result.rows;
}

export async function listVerifierOptions(): Promise<VerifierOption[]> {
  const result = await query<VerifierOption>(
    `SELECT verifier_id, name, role
     FROM verifiers
     ORDER BY name ASC`
  );
  return result.rows;
}