"use server";

import { revalidatePath } from "next/cache";
import { pool, PART_OF_SPEECH, type PartOfSpeech } from "@/lib/db";

export type CreateWordResult = {
  success: boolean;
  error?: string;
  wordId?: number;
};

const MAX_SHORT = 255;

function isPartOfSpeech(value: string): value is PartOfSpeech {
  return (PART_OF_SPEECH as readonly string[]).includes(value);
}

/**
 * Parse a list of "selected:123" checkbox values into numeric ids,
 * stripping anything that isn't a positive integer.
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

export async function createWord(formData: FormData): Promise<CreateWordResult> {
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

  // ── Validation ───────────────────────────────────────────
  if (!word_isn) {
    return { success: false, error: "Headword (word_isn) is required." };
  }
  if (word_isn.length > MAX_SHORT) {
    return { success: false, error: "Headword must be 255 characters or fewer." };
  }
  if (!pos || !isPartOfSpeech(pos)) {
    return { success: false, error: "Please select a valid part of speech." };
  }
  if (word_eng.length > MAX_SHORT || word_tlg.length > MAX_SHORT) {
    return { success: false, error: "Gloss fields must be 255 characters or fewer." };
  }
  if (!definition) {
    return { success: false, error: "Definition is required." };
  }

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