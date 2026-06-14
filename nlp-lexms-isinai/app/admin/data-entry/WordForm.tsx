"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import styles from "./data-entry.module.css";
import extra from "./data-entry-extra.module.css";
import { createWord, updateWord, getWordById } from "@/app/actions/words";
import { PART_OF_SPEECH, type CorpusOption, type VerifierOption } from "@/lib/constants";
import WordSearchSelect from "./WordSearchSelect";
import CorpusPreviewPanel from "./CorpusPreviewPanel";

type FormValues = {
  word_id: number | null;
  word_isn: string;
  pos: string;
  word_eng: string;
  word_tlg: string;
  definition: string;
  example_sentence: string;
  notes: string;
  verified: boolean;
  corpus_ids: number[];
  verifier_ids: number[];
};

const EMPTY_FORM: FormValues = {
  word_id: null,
  word_isn: "",
  pos: "",
  word_eng: "",
  word_tlg: "",
  definition: "",
  example_sentence: "",
  notes: "",
  verified: false,
  corpus_ids: [],
  verifier_ids: [],
};

export default function WordForm({
  corpusOptions,
  verifierOptions,
}: {
  corpusOptions: CorpusOption[];
  verifierOptions: VerifierOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditMode = values.word_id !== null;

  async function handleSelectWord(wordId: number) {
    setMessage(null);
    setIsLoadingEntry(true);
    try {
      const detail = await getWordById(wordId);
      if (!detail) {
        setMessage({ type: "error", text: "Could not load that entry." });
        return;
      }
      setValues({
        word_id: detail.word_id,
        word_isn: detail.word_isn,
        pos: detail.pos,
        word_eng: detail.word_eng ?? "",
        word_tlg: detail.word_tlg ?? "",
        definition: detail.definition,
        example_sentence: detail.example_sentence ?? "",
        notes: detail.notes ?? "",
        verified: detail.verified,
        corpus_ids: detail.corpus_ids,
        verifier_ids: detail.verifier_ids,
      });
      setSelectedLabel(`${detail.word_isn} (#${detail.word_id})`);
    } finally {
      setIsLoadingEntry(false);
    }
  }

  function handleClearSelection() {
    setValues(EMPTY_FORM);
    setSelectedLabel(null);
    setMessage(null);
    formRef.current?.reset();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setMessage(null);

    startTransition(async () => {
      if (isEditMode && values.word_id !== null) {
        formData.set("word_id", String(values.word_id));
        const result = await updateWord(formData);
        if (result.success) {
          setMessage({ type: "success", text: `Entry "${formData.get("word_isn")}" updated.` });
        } else {
          setMessage({ type: "error", text: result.error ?? "Something went wrong." });
        }
      } else {
        const result = await createWord(formData);
        if (result.success) {
          setMessage({ type: "success", text: `Entry "${formData.get("word_isn")}" saved.` });
          setValues(EMPTY_FORM);
          form.reset();
        } else {
          setMessage({ type: "error", text: result.error ?? "Something went wrong." });
        }
      }
    });
  }

  // Keep controlled inputs in sync with `values` when prefilled programmatically.
  useEffect(() => {
    // No-op effect placeholder to keep eslint happy if needed later.
  }, [values]);

  return (
    <div>
      <WordSearchSelect
        onSelect={handleSelectWord}
        selectedLabel={selectedLabel}
        onClear={handleClearSelection}
      />

      <div className={extra.toolbar}>
        <button
          type="button"
          className={`${extra.toggleBtn} ${showPreview ? extra.toggleBtnActive : ""}`}
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? "Hide corpus preview" : "Open corpus preview"}
        </button>
      </div>

      <div className={`${extra.splitLayout} ${showPreview ? extra.splitLayoutActive : ""}`}>
        <div className={extra.entryColumn}>
          <form className={styles.form} ref={formRef} onSubmit={handleSubmit}>
            {message && (
              <div
                className={
                  message.type === "success" ? styles.messageSuccess : styles.messageError
                }
              >
                {message.text}
              </div>
            )}
            {isLoadingEntry && (
              <div className={styles.message} style={{ color: "var(--ink-soft)" }}>
                Loading entry…
              </div>
            )}

            {isEditMode && <input type="hidden" name="word_id" value={values.word_id ?? ""} />}

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="word_isn">
                  Headword (Isinai) <span className={styles.required}>*</span>
                </label>
                <input
                  id="word_isn"
                  name="word_isn"
                  type="text"
                  className={styles.input}
                  maxLength={255}
                  required
                  value={values.word_isn}
                  onChange={(e) => setValues((v) => ({ ...v, word_isn: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="pos">
                  Part of speech <span className={styles.required}>*</span>
                </label>
                <select
                  id="pos"
                  name="pos"
                  className={styles.select}
                  required
                  value={values.pos}
                  onChange={(e) => setValues((v) => ({ ...v, pos: e.target.value }))}
                >
                  <option value="" disabled>
                    Select part of speech
                  </option>
                  {PART_OF_SPEECH.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="word_eng">
                  Gloss (English)
                </label>
                <input
                  id="word_eng"
                  name="word_eng"
                  type="text"
                  className={styles.input}
                  maxLength={255}
                  value={values.word_eng}
                  onChange={(e) => setValues((v) => ({ ...v, word_eng: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="word_tlg">
                  Gloss (Tagalog)
                </label>
                <input
                  id="word_tlg"
                  name="word_tlg"
                  type="text"
                  className={styles.input}
                  maxLength={255}
                  value={values.word_tlg}
                  onChange={(e) => setValues((v) => ({ ...v, word_tlg: e.target.value }))}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="definition">
                  Definition <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="definition"
                  name="definition"
                  className={styles.textarea}
                  required
                  value={values.definition}
                  onChange={(e) => setValues((v) => ({ ...v, definition: e.target.value }))}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="example_sentence">
                  Example sentence
                </label>
                <textarea
                  id="example_sentence"
                  name="example_sentence"
                  className={styles.textarea}
                  value={values.example_sentence}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, example_sentence: e.target.value }))
                  }
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className={styles.textarea}
                  value={values.notes}
                  onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Linked corpus sources</label>
                <div className={styles.panel}>
                  {corpusOptions.length === 0 ? (
                    <p className={styles.panelEmpty}>
                      No corpus sources yet — add one in the Corpus tab.
                    </p>
                  ) : (
                    corpusOptions.map((c) => (
                      <div className={styles.optionRow} key={c.corpus_id}>
                        <input
                          type="checkbox"
                          id={`corpus-${c.corpus_id}`}
                          name="corpus_ids"
                          value={c.corpus_id}
                          checked={values.corpus_ids.includes(c.corpus_id)}
                          onChange={(e) => {
                            setValues((v) => ({
                              ...v,
                              corpus_ids: e.target.checked
                                ? [...v.corpus_ids, c.corpus_id]
                                : v.corpus_ids.filter((id) => id !== c.corpus_id),
                            }));
                          }}
                        />
                        <label htmlFor={`corpus-${c.corpus_id}`} className={styles.optionLabel}>
                          {c.title} <span className={styles.optionMeta}>· {c.filetype}</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Verified by</label>
                <div className={styles.panel}>
                  {verifierOptions.length === 0 ? (
                    <p className={styles.panelEmpty}>
                      No verifiers yet — add one in the Verifier tab.
                    </p>
                  ) : (
                    verifierOptions.map((v) => (
                      <div className={styles.optionRow} key={v.verifier_id}>
                        <input
                          type="checkbox"
                          id={`verifier-${v.verifier_id}`}
                          name="verifier_ids"
                          value={v.verifier_id}
                          checked={values.verifier_ids.includes(v.verifier_id)}
                          onChange={(e) => {
                            setValues((prev) => ({
                              ...prev,
                              verifier_ids: e.target.checked
                                ? [...prev.verifier_ids, v.verifier_id]
                                : prev.verifier_ids.filter((id) => id !== v.verifier_id),
                            }));
                          }}
                        />
                        <label htmlFor={`verifier-${v.verifier_id}`} className={styles.optionLabel}>
                          {v.name}
                          {v.role ? <span className={styles.optionMeta}> · {v.role}</span> : null}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="verified"
                    name="verified"
                    checked={values.verified}
                    onChange={(e) => setValues((v) => ({ ...v, verified: e.target.checked }))}
                  />
                  <label htmlFor="verified">Mark as verified</label>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.submitBtn} disabled={isPending}>
                {isPending
                  ? "Saving…"
                  : isEditMode
                  ? "Update entry"
                  : "Save entry"}
              </button>
              <span className={styles.hint}>
                {isEditMode
                  ? `Updating word_id ${values.word_id}`
                  : "Writes to isinai_words"}
              </span>
              {isEditMode && (
                <button type="button" className={extra.clearBtn} onClick={handleClearSelection}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>

        {showPreview && <CorpusPreviewPanel />}
      </div>
    </div>
  );
}