import styles from "./data-entry.module.css";
import DataEntryTabs from "./DataEntryTabs";
import { listCorpusOptions, listVerifierOptions } from "@/lib/db";

export default async function DataEntryPage() {
  const [corpusOptions, verifierOptions] = await Promise.all([
    listCorpusOptions(),
    listVerifierOptions(),
  ]);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Data entry</div>
        <h1 className={styles.title}>Add to the lexicon</h1>
        <p className={styles.subtitle}>
          Add a new word, register a verifier, or log a corpus source. Word
          entries can be linked to existing corpus sources and verifiers.
        </p>
      </div>

      <DataEntryTabs corpusOptions={corpusOptions} verifierOptions={verifierOptions} />
    </div>
  );
}