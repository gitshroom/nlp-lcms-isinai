"use server";

import { revalidatePath } from "next/cache";
import { pool, CORPUS_TYPE, type CorpusType } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export type CreateCorpusResult = {
  success: boolean;
  error?: string;
  corpusId?: number;
};

const MAX_SHORT = 255;
const CURRENT_YEAR = new Date().getFullYear();
const MIN_PUB_YEAR = 1500;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function isCorpusType(value: string): value is CorpusType {
  return (CORPUS_TYPE as readonly string[]).includes(value);
}

export async function createCorpus(formData: FormData): Promise<CreateCorpusResult> {
  const title = String(formData.get("title") ?? "").trim();
  const filetype = String(formData.get("filetype") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const yearRaw = String(formData.get("publication_year") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const uploadedFile = formData.get("file") as File | null;

  // ── Validation ───────────────────────────────────────────
  if (!title) return { success: false, error: "Title is required." };
  if (title.length > MAX_SHORT || author.length > MAX_SHORT) {
    return { success: false, error: "Text fields must be 255 characters or fewer." };
  }
  if (!filetype || !isCorpusType(filetype)) {
    return { success: false, error: "Please select a valid file type." };
  }

  let publication_year: number | null = null;
  if (yearRaw) {
    const parsed = Number(yearRaw);
    if (!Number.isInteger(parsed) || parsed < MIN_PUB_YEAR || parsed > CURRENT_YEAR) {
      return {
        success: false,
        error: `Publication year must be between ${MIN_PUB_YEAR} and ${CURRENT_YEAR}.`,
      };
    }
    publication_year = parsed;
  }

  // ── File handling ────────────────────────────────────────
  let file_path: string | null = null;
  let filename: string | null = null;

  if (uploadedFile && uploadedFile.size > 0) {
    if (uploadedFile.size > MAX_FILE_SIZE) {
      return { success: false, error: "File must be 50 MB or smaller." };
    }
    if (!ALLOWED_MIME_TYPES.includes(uploadedFile.type)) {
      return { success: false, error: "File type not allowed." };
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "corpus");
    await mkdir(uploadDir, { recursive: true });

    // Prefix with timestamp to avoid collisions
    const safeName = uploadedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;
    const fullPath = path.join(uploadDir, uniqueName);

    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    await writeFile(fullPath, buffer);

    filename = uploadedFile.name;
    file_path = `/uploads/corpus/${uniqueName}`;
  }

  try {
    const result = await pool.query<{ corpus_id: number }>(
      `INSERT INTO corpus
         (title, filetype, filename, author, publication_year, description, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING corpus_id`,
      [
        title,
        filetype,
        filename,
        author || null,
        publication_year,
        description || null,
        file_path,
      ]
    );

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/data-entry");

    return { success: true, corpusId: result.rows[0].corpus_id };
  } catch (err) {
    console.error("createCorpus failed:", err);
    return { success: false, error: "Could not save this corpus source. Please try again." };
  }
}