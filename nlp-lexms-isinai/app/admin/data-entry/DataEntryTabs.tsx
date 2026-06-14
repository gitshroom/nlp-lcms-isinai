"use client";

import { useState } from "react";
import styles from "./data-entry.module.css";
import WordForm from "./WordForm";
import VerifierForm from "./VerifierForm";
import CorpusForm from "./CorpusForm";
import type { CorpusOption, VerifierOption } from "@/lib/db";

type Tab = "word" | "verifier" | "corpus";

export default function DataEntryTabs({
  corpusOptions,
  verifierOptions,
}: {
  corpusOptions: CorpusOption[];
  verifierOptions: VerifierOption[];
}) {
  const [tab, setTab] = useState<Tab>("word");

  return (
    <div>
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "word"}
          className={`${styles.tab} ${tab === "word" ? styles.tabActive : ""}`}
          onClick={() => setTab("word")}
        >
          Word
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "verifier"}
          className={`${styles.tab} ${tab === "verifier" ? styles.tabActive : ""}`}
          onClick={() => setTab("verifier")}
        >
          Verifier
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "corpus"}
          className={`${styles.tab} ${tab === "corpus" ? styles.tabActive : ""}`}
          onClick={() => setTab("corpus")}
        >
          Corpus
        </button>
      </div>

      {tab === "word" && (
        <WordForm corpusOptions={corpusOptions} verifierOptions={verifierOptions} />
      )}
      {tab === "verifier" && <VerifierForm />}
      {tab === "corpus" && <CorpusForm />}
    </div>
  );
}