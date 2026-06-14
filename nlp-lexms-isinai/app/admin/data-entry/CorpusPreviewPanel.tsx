"use client";

import { useEffect, useState } from "react";
import extra from "./data-entry-extra.module.css";
import { listAllCorpus, type CorpusDetail } from "@/app/actions/corpus";

function canEmbed(filetype: CorpusDetail["filetype"], filePath: string | null): boolean {
  if (!filePath) return false;
  const lower = filePath.toLowerCase();
  if (filetype === "pdf" || lower.endsWith(".pdf")) return true;
  if (filetype === "image" || /\.(png|jpe?g|gif|webp)$/.test(lower)) return true;
  return false;
}

export default function CorpusPreviewPanel() {
  const [corpusList, setCorpusList] = useState<CorpusDetail[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listAllCorpus()
      .then((rows) => {
        if (!active) return;
        setCorpusList(rows);
        if (rows.length > 0) setSelectedId(rows[0].corpus_id);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selected = corpusList.find((c) => c.corpus_id === selectedId) ?? null;
  const fileUrl = selected?.file_path ?? null;
  const embeddable = selected ? canEmbed(selected.filetype, fileUrl) : false;

  return (
    <div className={extra.previewPanel}>
      <div className={extra.previewHead}>
        <div className={extra.previewTitle}>Corpus reference</div>
        {corpusList.length > 0 && (
          <select
            className={extra.previewSelect}
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            {corpusList.map((c) => (
              <option key={c.corpus_id} value={c.corpus_id}>
                {c.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className={extra.previewEmpty}>Loading corpus list…</div>
      ) : corpusList.length === 0 ? (
        <div className={extra.previewEmpty}>
          No corpus sources yet — add one in the Corpus tab.
        </div>
      ) : selected ? (
        <>
          <div className={extra.previewMeta}>
            <div className={extra.previewMetaRow}>
              <span className={extra.previewMetaLabel}>Type</span>
              <span>{selected.filetype}</span>
            </div>
            {selected.author && (
              <div className={extra.previewMetaRow}>
                <span className={extra.previewMetaLabel}>Author</span>
                <span>{selected.author}</span>
              </div>
            )}
            {selected.publication_year && (
              <div className={extra.previewMetaRow}>
                <span className={extra.previewMetaLabel}>Year</span>
                <span>{selected.publication_year}</span>
              </div>
            )}
            {selected.filename && (
              <div className={extra.previewMetaRow}>
                <span className={extra.previewMetaLabel}>File</span>
                <span>{selected.filename}</span>
              </div>
            )}
          </div>

          {selected.description && (
            <div className={extra.previewDescription}>{selected.description}</div>
          )}

          {fileUrl && embeddable ? (
            <div className={extra.previewFrame}>
              {selected.filetype === "image" || /\.(png|jpe?g|gif|webp)$/i.test(fileUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fileUrl} alt={selected.title} />
              ) : (
                <iframe src={fileUrl} title={selected.title} />
              )}
            </div>
          ) : (
            <div className={extra.previewNoFile}>
              {selected.filename
                ? "This file type can't be previewed inline."
                : "No file attached to this corpus entry."}
            </div>
          )}

          {fileUrl && (
            <div className={extra.previewActions}>
              <a
                className={extra.previewOpenBtn}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new window ↗
              </a>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}