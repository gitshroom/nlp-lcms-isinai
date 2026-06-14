"use server";

import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";

export type CreateVerifierResult = {
  success: boolean;
  error?: string;
  verifierId?: number;
};

const MAX_SHORT = 255;
const MAX_YEARS = 120;

export async function createVerifier(formData: FormData): Promise<CreateVerifierResult> {
  const name = String(formData.get("name") ?? "").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const community = String(formData.get("community") ?? "").trim();
  const yearsRaw = String(formData.get("years_experience") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  // ── Validation ───────────────────────────────────────────
  if (!name) {
    return { success: false, error: "Name is required." };
  }
  if (
    name.length > MAX_SHORT ||
    affiliation.length > MAX_SHORT ||
    role.length > MAX_SHORT ||
    community.length > MAX_SHORT
  ) {
    return { success: false, error: "Text fields must be 255 characters or fewer." };
  }

  let years_experience: number | null = null;
  if (yearsRaw) {
    const parsed = Number(yearsRaw);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_YEARS) {
      return { success: false, error: "Years of experience must be a whole number between 0 and 120." };
    }
    years_experience = parsed;
  }

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