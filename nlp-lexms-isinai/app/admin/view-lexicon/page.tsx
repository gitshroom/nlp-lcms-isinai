import styles from "../dashboard/dashboard.module.css";

export default function ViewLexiconPage() {
  return (
    <div>
      <div className={styles.header}>
        <div className={styles.eyebrow}>View lexicon</div>
        <h1 className={styles.title}>Browse entries</h1>
        <p className={styles.subtitle}>
          Searchable, filterable list of all entries in isinai_words.
        </p>
      </div>
    </div>
  );
}