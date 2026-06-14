"use client";

import { useState, useTransition } from "react";
import styles from "./data-entry.module.css";
import { createWord } from "@/app/actions/words";
import { PART_OF_SPEECH, type CorpusOption, type VerifierOption } from "@/lib/constants";

export default function WordForm({
  corpusOptions,
  verifierOptions,
}: {
  corpusOptions: CorpusOption[];
  verifierOptions: VerifierOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setMessage(null);

    startTransition(async () => {
      const result = await createWord(formData);
      if (result.success) {
        setMessage({ type: "success", text: `Entry "${formData.get("word_isn")}" saved.` });
        form.reset();
      } else {
        setMessage({ type: "error", text: result.error ?? "Something went wrong." });
      }
    });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {message && (
        <div className={message.type === "success" ? styles.messageSuccess : styles.messageError}>
          {message.text}
        </div>
      )}

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
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="pos">
            Part of speech <span className={styles.required}>*</span>
          </label>
          <select id="pos" name="pos" className={styles.select} required defaultValue="">
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
          <input id="word_eng" name="word_eng" type="text" className={styles.input} maxLength={255} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="word_tlg">
            Gloss (Tagalog)
          </label>
          <input id="word_tlg" name="word_tlg" type="text" className={styles.input} maxLength={255} />
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="definition">
            Definition <span className={styles.required}>*</span>
          </label>
          <textarea id="definition" name="definition" className={styles.textarea} required />
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="example_sentence">
            Example sentence
          </label>
          <textarea id="example_sentence" name="example_sentence" className={styles.textarea} />
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="notes">
            Notes
          </label>
          <textarea id="notes" name="notes" className={styles.textarea} />
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label}>Linked corpus sources</label>
          <div className={styles.panel}>
            {corpusOptions.length === 0 ? (
              <p className={styles.panelEmpty}>No corpus sources yet — add one in the Corpus tab.</p>
            ) : (
              corpusOptions.map((c) => (
                <div className={styles.optionRow} key={c.corpus_id}>
                  <input type="checkbox" id={`corpus-${c.corpus_id}`} name="corpus_ids" value={c.corpus_id} />
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
              <p className={styles.panelEmpty}>No verifiers yet — add one in the Verifier tab.</p>
            ) : (
              verifierOptions.map((v) => (
                <div className={styles.optionRow} key={v.verifier_id}>
                  <input
                    type="checkbox"
                    id={`verifier-${v.verifier_id}`}
                    name="verifier_ids"
                    value={v.verifier_id}
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
            <input type="checkbox" id="verified" name="verified" />
            <label htmlFor="verified">Mark as verified</label>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? "Saving…" : "Save entry"}
        </button>
        <span className={styles.hint}>Writes to isinai_words</span>
      </div>
    </form>
  );
}