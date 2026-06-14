"use server";

import { revalidatePath } from "next/cache";
import { pool, CORPUS_TYPE, type CorpusType } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
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

  // ── Validation (no side effects yet) ────────────────────
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

  let filename: string | null = null;
  let file_path: string | null = null;
  let hasFile = false;

  if (uploadedFile && uploadedFile.size > 0) {
    hasFile = true;
    if (uploadedFile.size > MAX_FILE_SIZE) {
      return { success: false, error: "File must be 50 MB or smaller." };
    }
    if (!ALLOWED_MIME_TYPES.includes(uploadedFile.type)) {
      return { success: false, error: "File type not allowed." };
    }

    const safeName = uploadedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;
    filename = uploadedFile.name;
    file_path = `/uploads/corpus/${uniqueName}`;
  }

  // ── Database insert first ────────────────────────────────
  // The file is written to disk only after this succeeds, and is
  // removed again if the subsequent write fails — so a failed
  // request never leaves behind an orphaned row or an orphaned file.
  let corpusId: number;
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
    corpusId = result.rows[0].corpus_id;
  } catch (err) {
    console.error("createCorpus insert failed:", err);
    return { success: false, error: "Could not save this corpus source. Please try again." };
  }

  // ── File write second ────────────────────────────────────
  if (hasFile && uploadedFile && file_path) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "corpus");
    const fullPath = path.join(process.cwd(), "public", file_path);

    try {
      await mkdir(uploadDir, { recursive: true });
      const buffer = Buffer.from(await uploadedFile.arrayBuffer());
      await writeFile(fullPath, buffer);
    } catch (err) {
      console.error("createCorpus file write failed:", err);
      // Roll back the row we just inserted so the DB doesn't reference
      // a file that doesn't exist on disk.
      await pool.query(`DELETE FROM corpus WHERE corpus_id = $1`, [corpusId]).catch((rollbackErr) => {
        console.error("createCorpus rollback failed:", rollbackErr);
      });
      return { success: false, error: "Could not save the uploaded file. Please try again." };
    }
  }

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/data-entry");

  return { success: true, corpusId };
}

// helper retained for cleanup callers if needed elsewhere
export async function deleteCorpusFile(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), "public", filePath);
  await unlink(fullPath).catch(() => {
    // file may already be gone — nothing to do
  });
}

// ── Read helpers for the corpus preview panel ──────────────────

export type CorpusDetail = {
  corpus_id: number;
  title: string;
  filetype: CorpusType;
  filename: string | null;
  file_path: string | null;
  author: string | null;
  publication_year: number | null;
  description: string | null;
};

export async function listAllCorpus(): Promise<CorpusDetail[]> {
  const result = await pool.query<CorpusDetail>(
    `SELECT corpus_id, title, filetype, filename, file_path, author, publication_year, description
     FROM corpus
     ORDER BY title ASC`
  );
  return result.rows;
}

export async function getCorpusById(corpusId: number): Promise<CorpusDetail | null> {
  if (!Number.isInteger(corpusId) || corpusId <= 0) {
    return null;
  }

  const result = await pool.query<CorpusDetail>(
    `SELECT corpus_id, title, filetype, filename, file_path, author, publication_year, description
     FROM corpus
     WHERE corpus_id = $1`,
    [corpusId]
  );

  return result.rows[0] ?? null;
}