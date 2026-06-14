"use client";

import { useRef, useState, useTransition } from "react";
import styles from "./data-entry.module.css";
import extra from "./data-entry-extra.module.css";
import { createVerifier, updateVerifier, getVerifierById } from "@/app/actions/verifiers";
import VerifierSearchSelect from "./VerifierSearchSelect";

type FormValues = {
  verifier_id: number | null;
  name: string;
  affiliation: string;
  role: string;
  community: string;
  years_experience: string;
  notes: string;
};

const EMPTY_FORM: FormValues = {
  verifier_id: null,
  name: "",
  affiliation: "",
  role: "",
  community: "",
  years_experience: "",
  notes: "",
};

export default function VerifierForm() {
  const [isPending, startTransition] = useTransition();
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEditMode = values.verifier_id !== null;

  async function handleSelectVerifier(verifierId: number) {
    setMessage(null);
    setIsLoadingEntry(true);
    try {
      const detail = await getVerifierById(verifierId);
      if (!detail) {
        setMessage({ type: "error", text: "Could not load that verifier." });
        return;
      }
      setValues({
        verifier_id: detail.verifier_id,
        name: detail.name,
        affiliation: detail.affiliation ?? "",
        role: detail.role ?? "",
        community: detail.community ?? "",
        years_experience:
          detail.years_experience !== null ? String(detail.years_experience) : "",
        notes: detail.notes ?? "",
      });
      setSelectedLabel(`${detail.name} (#${detail.verifier_id})`);
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
      if (isEditMode && values.verifier_id !== null) {
        formData.set("verifier_id", String(values.verifier_id));
        const result = await updateVerifier(formData);
        if (result.success) {
          setMessage({ type: "success", text: `Verifier "${formData.get("name")}" updated.` });
        } else {
          setMessage({ type: "error", text: result.error ?? "Something went wrong." });
        }
      } else {
        const result = await createVerifier(formData);
        if (result.success) {
          setMessage({ type: "success", text: `Verifier "${formData.get("name")}" saved.` });
          setValues(EMPTY_FORM);
          form.reset();
        } else {
          setMessage({ type: "error", text: result.error ?? "Something went wrong." });
        }
      }
    });
  }

  return (
    <div>
      <VerifierSearchSelect
        onSelect={handleSelectVerifier}
        selectedLabel={selectedLabel}
        onClear={handleClearSelection}
      />

      <form className={styles.form} ref={formRef} onSubmit={handleSubmit}>
        {message && (
          <div className={message.type === "success" ? styles.messageSuccess : styles.messageError}>
            {message.text}
          </div>
        )}
        {isLoadingEntry && (
          <div className={styles.message} style={{ color: "var(--ink-soft)" }}>
            Loading verifier…
          </div>
        )}

        {isEditMode && (
          <input type="hidden" name="verifier_id" value={values.verifier_id ?? ""} />
        )}

        <div className={styles.fieldGrid}>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label} htmlFor="name">
              Name <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className={styles.input}
              maxLength={255}
              required
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="affiliation">
              Affiliation
            </label>
            <input
              id="affiliation"
              name="affiliation"
              type="text"
              className={styles.input}
              maxLength={255}
              value={values.affiliation}
              onChange={(e) => setValues((v) => ({ ...v, affiliation: e.target.value }))}
            />
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
              value={values.role}
              onChange={(e) => setValues((v) => ({ ...v, role: e.target.value }))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="community">
              Community
            </label>
            <input
              id="community"
              name="community"
              type="text"
              className={styles.input}
              maxLength={255}
              value={values.community}
              onChange={(e) => setValues((v) => ({ ...v, community: e.target.value }))}
            />
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
              value={values.years_experience}
              onChange={(e) => setValues((v) => ({ ...v, years_experience: e.target.value }))}
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
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={isPending}>
            {isPending ? "Saving…" : isEditMode ? "Update verifier" : "Save verifier"}
          </button>
          <span className={styles.hint}>
            {isEditMode ? `Updating verifier_id ${values.verifier_id}` : "Writes to verifiers"}
          </span>
          {isEditMode && (
            <button type="button" className={extra.clearBtn} onClick={handleClearSelection}>
              Cancel edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}