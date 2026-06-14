"use server";

import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";

export type CreateVerifierResult = {
  success: boolean;
  error?: string;
  verifierId?: number;
};

export type UpdateVerifierResult = {
  success: boolean;
  error?: string;
  verifierId?: number;
};

export type VerifierSearchResult = {
  verifier_id: number;
  name: string;
  role: string | null;
  community: string | null;
};

export type VerifierDetail = {
  verifier_id: number;
  name: string;
  affiliation: string | null;
  role: string | null;
  community: string | null;
  years_experience: number | null;
  notes: string | null;
};

const MAX_SHORT = 255;
const MAX_YEARS = 120;
const SEARCH_LIMIT = 20;
const MAX_QUERY_LEN = 255;

type ParsedVerifierFields = {
  name: string;
  affiliation: string;
  role: string;
  community: string;
  years_experience: number | null;
  notes: string;
};

type ParseResult =
  | { ok: true; data: ParsedVerifierFields }
  | { ok: false; error: string };

/**
 * Shared field extraction + validation for create and update.
 */
function parseAndValidateVerifierFields(formData: FormData): ParseResult {
  const name = String(formData.get("name") ?? "").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const community = String(formData.get("community") ?? "").trim();
  const yearsRaw = String(formData.get("years_experience") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  // ── Validation ───────────────────────────────────────────
  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (
    name.length > MAX_SHORT ||
    affiliation.length > MAX_SHORT ||
    role.length > MAX_SHORT ||
    community.length > MAX_SHORT
  ) {
    return { ok: false, error: "Text fields must be 255 characters or fewer." };
  }

  let years_experience: number | null = null;
  if (yearsRaw) {
    const parsed = Number(yearsRaw);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_YEARS) {
      return {
        ok: false,
        error: "Years of experience must be a whole number between 0 and 120.",
      };
    }
    years_experience = parsed;
  }

  return {
    ok: true,
    data: { name, affiliation, role, community, years_experience, notes },
  };
}

// ── Create ───────────────────────────────────────────────────

export async function createVerifier(formData: FormData): Promise<CreateVerifierResult> {
  const parsed = parseAndValidateVerifierFields(formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }
  const { name, affiliation, role, community, years_experience, notes } = parsed.data;

  try {
    const result = await pool.query<{ verifier_id: number }>(
      `INSERT INTO verifiers
         (name, affiliation, role, community, years_experience, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING verifier_id`,
      [
        name,
        affiliation || null,
        role || null,
        community || null,
        years_experience,
        notes || null,
      ]
    );

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/data-entry");

    return { success: true, verifierId: result.rows[0].verifier_id };
  } catch (err) {
    console.error("createVerifier failed:", err);
    return { success: false, error: "Could not save this verifier. Please try again." };
  }
}

// ── Update ───────────────────────────────────────────────────

export async function updateVerifier(formData: FormData): Promise<UpdateVerifierResult> {
  const verifierIdRaw = String(formData.get("verifier_id") ?? "").trim();
  const verifierId = Number(verifierIdRaw);

  if (!Number.isInteger(verifierId) || verifierId <= 0) {
    return { success: false, error: "Invalid verifier — missing or bad verifier_id." };
  }

  const parsed = parseAndValidateVerifierFields(formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }
  const { name, affiliation, role, community, years_experience, notes } = parsed.data;

  try {
    const result = await pool.query(
      `UPDATE verifiers
         SET name = $1,
             affiliation = $2,
             role = $3,
             community = $4,
             years_experience = $5,
             notes = $6
       WHERE verifier_id = $7`,
      [
        name,
        affiliation || null,
        role || null,
        community || null,
        years_experience,
        notes || null,
        verifierId,
      ]
    );

    if (result.rowCount === 0) {
      return { success: false, error: "Verifier not found. It may have been deleted." };
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/data-entry");

    return { success: true, verifierId };
  } catch (err) {
    console.error("updateVerifier failed:", err);
    return { success: false, error: "Could not update this verifier. Please try again." };
  }
}

// ── Search ───────────────────────────────────────────────────

/**
 * Search verifiers by name, role, or community
 * (case-insensitive partial match). Returns a short list for
 * a search-and-select UI.
 */
export async function searchVerifiers(rawQuery: string): Promise<VerifierSearchResult[]> {
  const q = rawQuery.trim().slice(0, MAX_QUERY_LEN);

  if (!q) {
    return [];
  }

  // Escape LIKE wildcard characters the user might type literally.
  const escaped = q.replace(/[%_\\]/g, (ch) => `\\${ch}`);
  const pattern = `%${escaped}%`;

  const result = await pool.query<VerifierSearchResult>(
    `SELECT verifier_id, name, role, community
     FROM verifiers
     WHERE name ILIKE $1 ESCAPE '\\'
        OR role ILIKE $1 ESCAPE '\\'
        OR community ILIKE $1 ESCAPE '\\'
     ORDER BY name ASC
     LIMIT $2`,
    [pattern, SEARCH_LIMIT]
  );

  return result.rows;
}

// ── Get by id (for prefilling the edit form) ───────────────────

export async function getVerifierById(verifierId: number): Promise<VerifierDetail | null> {
  if (!Number.isInteger(verifierId) || verifierId <= 0) {
    return null;
  }

  const result = await pool.query<VerifierDetail>(
    `SELECT verifier_id, name, affiliation, role, community, years_experience, notes
     FROM verifiers
     WHERE verifier_id = $1`,
    [verifierId]
  );

  return result.rows[0] ?? null;
}