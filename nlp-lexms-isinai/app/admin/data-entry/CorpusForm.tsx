"use client";

import { useState, useTransition, useRef } from "react";
import styles from "./data-entry.module.css";
import { createCorpus } from "@/app/actions/corpus";
import { CORPUS_TYPE } from "@/lib/constants";

function FilePreview({ file }: { file: File }) {
  const url = URL.createObjectURL(file);
  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");
  const isText = file.type === "text/plain" || file.name.endsWith(".txt");
  const [textContent, setTextContent] = useState<string | null>(null);

  if (isText && textContent === null) {
    file.text().then(setTextContent);
  }

  if (isPdf) {
    return (
      <iframe
        src={url}
        title="PDF preview"
        style={{ width: "100%", height: "100%", border: "none", borderRadius: "6px" }}
      />
    );
  }

  if (isImage) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "1rem" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Preview"
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "6px" }}
        />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: "1rem", color: "var(--color-text-muted, #6b7280)", fontSize: "0.875rem" }}>
            {file.name}
          </p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={url} style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  if (isText) {
    return (
      <pre style={{
        padding: "1rem",
        fontSize: "0.8rem",
        lineHeight: 1.6,
        overflowY: "auto",
        height: "100%",
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        color: "var(--color-text, #111)",
      }}>
        {textContent ?? "Loading…"}
      </pre>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-text-muted, #6b7280)", fontSize: "0.875rem", padding: "2rem", textAlign: "center" }}>
      <div>
        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</p>
        <p>{file.name}</p>
        <p style={{ marginTop: "0.25rem", fontSize: "0.75rem" }}>No preview available for this file type.</p>
      </div>
    </div>
  );
}

export default function CorpusForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPreviewFile(file);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setMessage(null);

    startTransition(async () => {
      const result = await createCorpus(formData);
      if (result.success) {
        setMessage({ type: "success", text: `Corpus source "${formData.get("title")}" saved.` });
        form.reset();
        setPreviewFile(null);
      } else {
        setMessage({ type: "error", text: result.error ?? "Something went wrong." });
      }
    });
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: previewFile ? "1fr 1fr" : "1fr",
      gap: "1.5rem",
      alignItems: "start",
    }}>
      {/* ── Form ── */}
      <form className={styles.form} onSubmit={handleSubmit}>
        {message && (
          <div className={message.type === "success" ? styles.messageSuccess : styles.messageError}>
            {message.text}
          </div>
        )}

        <div className={styles.fieldGrid}>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="file">
              Upload file <span className={styles.optionMeta}>· PDF, image, audio, text — max 50 MB</span>
            </label>
            <input
              ref={fileInputRef}
              id="file"
              name="file"
              type="file"
              className={styles.input}
              accept=".pdf,.jpg,.jpeg,.png,.webp,.mp3,.wav,.ogg,.txt,.doc,.docx"
              onChange={handleFileChange}
            />
            {previewFile && (
              <p className={styles.optionMeta} style={{ marginTop: "0.25rem" }}>
                {previewFile.name} · {(previewFile.size / 1024 / 1024).toFixed(2)} MB
                {previewFile.size > 50 * 1024 * 1024 && (
                  <span style={{ color: "red" }}> — exceeds 50 MB limit</span>
                )}
              </p>
            )}
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="title">
              Title <span className={styles.required}>*</span>
            </label>
            <input id="title" name="title" type="text" className={styles.input} maxLength={255} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="filetype">
              File type <span className={styles.required}>*</span>
            </label>
            <select id="filetype" name="filetype" className={styles.select} required defaultValue="">
              <option value="" disabled>Select file type</option>
              {CORPUS_TYPE.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="author">
              Author
            </label>
            <input id="author" name="author" type="text" className={styles.input} maxLength={255} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="publication_year">
              Publication year
            </label>
            <input
              id="publication_year"
              name="publication_year"
              type="number"
              className={styles.input}
              min={1500}
              max={new Date().getFullYear()}
              step={1}
            />
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="description">
              Description
            </label>
            <textarea id="description" name="description" className={styles.textarea} />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={isPending}>
            {isPending ? "Saving…" : "Save corpus source"}
          </button>
          <span className={styles.hint}>Writes to corpus</span>
        </div>
      </form>

      {/* ── Preview panel ── */}
      {previewFile && (
        <div style={{
          position: "sticky",
          top: "1rem",
          height: "calc(100vh - 8rem)",
          border: "1px solid var(--color-border, #e5e7eb)",
          borderRadius: "8px",
          overflow: "hidden",
          background: "var(--color-surface, #f9fafb)",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            padding: "0.625rem 0.875rem",
            borderBottom: "1px solid var(--color-border, #e5e7eb)",
            fontSize: "0.75rem",
            color: "var(--color-text-muted, #6b7280)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}>
            <span>Preview — {previewFile.name}</span>
            <button
              type="button"
              onClick={() => {
                setPreviewFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted, #6b7280)",
                fontSize: "1rem",
                lineHeight: 1,
                padding: "0.125rem 0.25rem",
              }}
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            <FilePreview file={previewFile} />
          </div>
        </div>
      )}
    </div>
  );
}