import styles from "../dashboard/dashboard.module.css";

export default function DataEntryPage() {
  return (
    <div>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Data entry</div>
        <h1 className={styles.title}>Add a new entry</h1>
        <p className={styles.subtitle}>
          Form for adding new words to isinai_words — headword, part of
          speech, definitions, and notes.
        </p>
      </div>
    </div>
  );
}