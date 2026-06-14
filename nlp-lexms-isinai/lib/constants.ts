// lib/constants.ts
// ─────────────────────────────────────────────────────────────
// Shared constants and types that are safe to import in both
// client components and server code.
// No pg / Node-only imports here — ever.
// ─────────────────────────────────────────────────────────────

export const PART_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
  "particle",
  "affix",
  "other",
] as const;

export type PartOfSpeech = (typeof PART_OF_SPEECH)[number];

export const CORPUS_TYPE = [
  "pdf",
  "image",
  "audio_transcript",
  "research_paper",
  "interview",
  "field_notes",
  "other",
] as const;

export type CorpusType = (typeof CORPUS_TYPE)[number];

// ── Shared row types ─────────────────────────────────────────

export type CorpusOption = {
  corpus_id: number;
  title: string;
  filetype: CorpusType;
};

export type VerifierOption = {
  verifier_id: number;
  name: string;
  role: string | null;
};