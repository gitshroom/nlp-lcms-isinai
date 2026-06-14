"use client";

import { useState, useTransition } from "react";
import styles from "./data-entry.module.css";
import { createVerifier } from "@/app/actions/verifiers";

export default function VerifierForm() {
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
      const result = await createVerifier(formData);
      if (result.success) {
        setMessage({ type: "success", text: `Verifier "${formData.get("name")}" saved.` });
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
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="name">
            Name <span className={styles.required}>*</span>
          </label>
          <input id="name" name="name" type="text" className={styles.input} maxLength={255} required />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="affiliation">
            Affiliation
          </label>
          <input id="affiliation" name="affiliation" type="text" className={styles.input} maxLength={255} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="role">
            Role
          </label>
          <input
            id="role"
            name="role"
            type="text"
            className={styles.input}
            maxLength={255}
            placeholder="e.g. Elder, Teacher, Researcher"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="community">
            Community
          </label>
          <input id="community" name="community" type="text" className={styles.input} maxLength={255} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="years_experience">
            Years of experience
          </label>
          <input
            id="years_experience"
            name="years_experience"
            type="number"
            className={styles.input}
            min={0}
            max={120}
            step={1}
          />
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label} htmlFor="notes">
            Notes
          </label>
          <textarea id="notes" name="notes" className={styles.textarea} />
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? "Saving…" : "Save verifier"}
        </button>
        <span className={styles.hint}>Writes to verifiers</span>
      </div>
    </form>
  );
}