"use server";

import { revalidatePath } from "next/cache";
import { pool, PART_OF_SPEECH, type PartOfSpeech } from "@/lib/db";

export type CreateWordResult = {
  success: boolean;
  error?: string;
  wordId?: number;
};

export type UpdateWordResult = {
  success: boolean;
  error?: string;
  wordId?: number;
};

export type WordSearchResult = {
  word_id: number;
  word_isn: string;
  pos: PartOfSpeech;
  word_eng: string | null;
  verified: boolean;
};

export type WordDetail = {
  word_id: number;
  word_isn: string;
  pos: PartOfSpeech;
  word_eng: string | null;
  word_tlg: string | null;
  definition: string;
  example_sentence: string | null;
  notes: string | null;
  verified: boolean;
  corpus_ids: number[];
  verifier_ids: number[];
};

const MAX_SHORT = 255;

function isPartOfSpeech(value: string): value is PartOfSpeech {
  return (PART_OF_SPEECH as readonly string[]).includes(value);
}

/**
 * Parse a list of checkbox values into numeric ids, stripping anything
 * that isn't a positive integer.
 */
function parseIds(values: FormDataEntryValue[]): number[] {
  const ids = new Set<number>();
  for (const value of values) {
    const id = Number(value);
    if (Number.isInteger(id) && id > 0) {
      ids.add(id);
    }
  }
  return [...ids];
}

type ParsedWordFields = {
  word_isn: string;
  pos: PartOfSpeech;
  word_eng: string;
  word_tlg: string;
  definition: string;
  example_sentence: string;
  notes: string;
  verified: boolean;
  corpusIds: number[];
  verifierIds: number[];
};

type ParseResult =
  | { ok: true; data: ParsedWordFields }
  | { ok: false; error: string };

/**
 * Shared field extraction + validation for create and update.
 */
function parseAndValidateWordFields(formData: FormData): ParseResult {
  const word_isn = String(formData.get("word_isn") ?? "").trim();
  const pos = String(formData.get("pos") ?? "").trim();
  const word_eng = String(formData.get("word_eng") ?? "").trim();
  const word_tlg = String(formData.get("word_tlg") ?? "").trim();
  const definition = String(formData.get("definition") ?? "").trim();
  const example_sentence = String(formData.get("example_sentence") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const verified = formData.get("verified") === "on";

  const corpusIds = parseIds(formData.getAll("corpus_ids"));
  const verifierIds = parseIds(formData.getAll("verifier_ids"));

  if (!word_isn) {
    return { ok: false, error: "Headword (word_isn) is required." };
  }
  if (word_isn.length > MAX_SHORT) {
    return { ok: false, error: "Headword must be 255 characters or fewer." };
  }
  if (!pos || !isPartOfSpeech(pos)) {
    return { ok: false, error: "Please select a valid part of speech." };
  }
  if (word_eng.length > MAX_SHORT || word_tlg.length > MAX_SHORT) {
    return { ok: false, error: "Gloss fields must be 255 characters or fewer." };
  }
  if (!definition) {
    return { ok: false, error: "Definition is required." };
  }

  return {
    ok: true,
    data: {
      word_isn,
      pos,
      word_eng,
      word_tlg,
      definition,
      example_sentence,
      notes,
      verified,
      corpusIds,
      verifierIds,
    },
  };
}

// ── Create ───────────────────────────────────────────────────

export async function createWord(formData: FormData): Promise<CreateWordResult> {
  const parsed = parseAndValidateWordFields(formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }
  const {
    word_isn,
    pos,
    word_eng,
    word_tlg,
    definition,
    example_sentence,
    notes,
    verified,
    corpusIds,
    verifierIds,
  } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertResult = await client.query<{ word_id: number }>(
      `INSERT INTO isinai_words
         (word_isn, pos, word_eng, word_tlg, definition, example_sentence, notes, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING word_id`,
      [
        word_isn,
        pos,
        word_eng || null,
        word_tlg || null,
        definition,
        example_sentence || null,
        notes || null,
        verified,
      ]
    );

    const wordId = insertResult.rows[0].word_id;

    if (corpusIds.length > 0) {
      const values = corpusIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO word_corpusreference (word_id, corpus_id)
         VALUES ${values}
         ON CONFLICT DO NOTHING`,
        [wordId, ...corpusIds]
      );
    }

    if (verifierIds.length > 0) {
      const values = verifierIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO word_verifier (word_id, verifier_id)
         VALUES ${values}
         ON CONFLICT DO NOTHING`,
        [wordId, ...verifierIds]
      );
    }

    await client.query("COMMIT");

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/view-lexicon");

    return { success: true, wordId };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createWord failed:", err);
    return { success: false, error: "Could not save this entry. Please try again." };
  } finally {
    client.release();
  }
}

// ── Update ───────────────────────────────────────────────────

export async function updateWord(formData: FormData): Promise<UpdateWordResult> {
  const wordIdRaw = String(formData.get("word_id") ?? "").trim();
  const wordId = Number(wordIdRaw);

  if (!Number.isInteger(wordId) || wordId <= 0) {
    return { success: false, error: "Invalid entry — missing or bad word_id." };
  }

  const parsed = parseAndValidateWordFields(formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }
  const {
    word_isn,
    pos,
    word_eng,
    word_tlg,
    definition,
    example_sentence,
    notes,
    verified,
    corpusIds,
    verifierIds,
  } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE isinai_words
         SET word_isn = $1,
             pos = $2,
             word_eng = $3,
             word_tlg = $4,
             definition = $5,
             example_sentence = $6,
             notes = $7,
             verified = $8,
             date_modified = NOW()
       WHERE word_id = $9`,
      [
        word_isn,
        pos,
        word_eng || null,
        word_tlg || null,
        definition,
        example_sentence || null,
        notes || null,
        verified,
        wordId,
      ]
    );

    if (updateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "Entry not found. It may have been deleted." };
    }

    // Replace junction rows with the current selection.
    await client.query(`DELETE FROM word_corpusreference WHERE word_id = $1`, [wordId]);
    if (corpusIds.length > 0) {
      const values = corpusIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO word_corpusreference (word_id, corpus_id)
         VALUES ${values}
         ON CONFLICT DO NOTHING`,
        [wordId, ...corpusIds]
      );
    }

    await client.query(`DELETE FROM word_verifier WHERE word_id = $1`, [wordId]);
    if (verifierIds.length > 0) {
      const values = verifierIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO word_verifier (word_id, verifier_id)
         VALUES ${values}
         ON CONFLICT DO NOTHING`,
        [wordId, ...verifierIds]
      );
    }

    await client.query("COMMIT");

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/view-lexicon");

    return { success: true, wordId };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateWord failed:", err);
    return { success: false, error: "Could not update this entry. Please try again." };
  } finally {
    client.release();
  }
}

// ── Search ───────────────────────────────────────────────────

const SEARCH_LIMIT = 20;
const MAX_QUERY_LEN = 255;

/**
 * Search words by headword, English gloss, or Tagalog gloss
 * (case-insensitive partial match). Returns a short list for
 * a search-and-select UI.
 */
export async function searchWords(rawQuery: string): Promise<WordSearchResult[]> {
  const q = rawQuery.trim().slice(0, MAX_QUERY_LEN);

  if (!q) {
    return [];
  }

  // Escape LIKE wildcard characters the user might type literally.
  const escaped = q.replace(/[%_\\]/g, (ch) => `\\${ch}`);
  const pattern = `%${escaped}%`;

  const result = await pool.query<WordSearchResult>(
    `SELECT word_id, word_isn, pos, word_eng, verified
     FROM isinai_words
     WHERE word_isn ILIKE $1 ESCAPE '\\'
        OR word_eng ILIKE $1 ESCAPE '\\'
        OR word_tlg ILIKE $1 ESCAPE '\\'
     ORDER BY word_isn ASC
     LIMIT $2`,
    [pattern, SEARCH_LIMIT]
  );

  return result.rows;
}

// ── Get by id (for prefilling the edit form) ───────────────────

export async function getWordById(wordId: number): Promise<WordDetail | null> {
  if (!Number.isInteger(wordId) || wordId <= 0) {
    return null;
  }

  const wordResult = await pool.query(
    `SELECT word_id, word_isn, pos, word_eng, word_tlg, definition,
            example_sentence, notes, verified
     FROM isinai_words
     WHERE word_id = $1`,
    [wordId]
  );

  if (wordResult.rowCount === 0) {
    return null;
  }

  const row = wordResult.rows[0];

  const corpusResult = await pool.query<{ corpus_id: number }>(
    `SELECT corpus_id FROM word_corpusreference WHERE word_id = $1`,
    [wordId]
  );

  const verifierResult = await pool.query<{ verifier_id: number }>(
    `SELECT verifier_id FROM word_verifier WHERE word_id = $1`,
    [wordId]
  );

  return {
    word_id: row.word_id,
    word_isn: row.word_isn,
    pos: row.pos,
    word_eng: row.word_eng,
    word_tlg: row.word_tlg,
    definition: row.definition,
    example_sentence: row.example_sentence,
    notes: row.notes,
    verified: row.verified,
    corpus_ids: corpusResult.rows.map((r) => r.corpus_id),
    verifier_ids: verifierResult.rows.map((r) => r.verifier_id),
  };
}