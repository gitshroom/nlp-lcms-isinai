import styles from "./dashboard.module.css";

// ── Placeholder data ──────────────────────────────────────────
// Shaped to match isinai_words, corpus, and verifiers tables.
// Replace with live queries against `pool` from "@/lib/db" once ready.

const stats = {
  totalWords: 1284,
  verifiedWords: 947,
  pendingWords: 337,
  totalCorpus: 42,
  totalVerifiers: 9,
};

const posBreakdown: { pos: string; count: number }[] = [
  { pos: "noun", count: 512 },
  { pos: "verb", count: 318 },
  { pos: "adjective", count: 201 },
  { pos: "adverb", count: 88 },
  { pos: "particle", count: 64 },
  { pos: "affix", count: 41 },
  { pos: "pronoun", count: 28 },
  { pos: "preposition", count: 17 },
  { pos: "conjunction", count: 11 },
  { pos: "interjection", count: 3 },
  { pos: "other", count: 1 },
];

const maxPosCount = Math.max(...posBreakdown.map((p) => p.count));

type RecentEntry = {
  word_id: number;
  word_isn: string;
  pos: string;
  word_eng: string | null;
  verified: boolean;
  date_modified: string;
};

const recentEntries: RecentEntry[] = [
  {
    word_id: 1284,
    word_isn: "tahanan",
    pos: "noun",
    word_eng: "home",
    verified: true,
    date_modified: "2026-06-13",
  },
  {
    word_id: 1283,
    word_isn: "umalis",
    pos: "verb",
    word_eng: "to leave",
    verified: false,
    date_modified: "2026-06-12",
  },
  {
    word_id: 1282,
    word_isn: "mabini",
    pos: "adjective",
    word_eng: "gentle, modest",
    verified: false,
    date_modified: "2026-06-12",
  },
  {
    word_id: 1281,
    word_isn: "pamilya",
    pos: "noun",
    word_eng: "family",
    verified: true,
    date_modified: "2026-06-11",
  },
  {
    word_id: 1280,
    word_isn: "agad",
    pos: "adverb",
    word_eng: "immediately",
    verified: true,
    date_modified: "2026-06-10",
  },
  {
    word_id: 1279,
    word_isn: "bahay",
    pos: "noun",
    word_eng: "house",
    verified: true,
    date_modified: "2026-06-10",
  },
];

const corpusByType: { type: string; count: number }[] = [
  { type: "field_notes", count: 16 },
  { type: "interview", count: 11 },
  { type: "research_paper", count: 8 },
  { type: "pdf", count: 4 },
  { type: "audio_transcript", count: 2 },
  { type: "image", count: 1 },
];

const recentVerifiers: { name: string; community: string | null; role: string | null }[] = [
  { name: "L. Marasigan", community: "Brgy. San Isidro", role: "Elder" },
  { name: "R. Domingo", community: "Brgy. Santa Cruz", role: "Teacher" },
  { name: "A. Villaflor", community: "Brgy. San Isidro", role: "Researcher" },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const verifiedPct = Math.round((stats.verifiedWords / stats.totalWords) * 100);

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Dashboard</div>
        <h1 className={styles.title}>Lexicon overview</h1>
        <p className={styles.subtitle}>
          Current state of the ISINAI lexicon — entry counts, verification
          status, and recent activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total entries</div>
          <div className={styles.statValue}>{stats.totalWords.toLocaleString()}</div>
          <div className={styles.statMeta}>isinai_words</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Verified</div>
          <div className={styles.statValue}>{stats.verifiedWords.toLocaleString()}</div>
          <div className={styles.statMeta}>{verifiedPct}% of total</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pending review</div>
          <div className={styles.statValue}>{stats.pendingWords.toLocaleString()}</div>
          <div className={styles.statMeta}>verified = false</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Verifiers</div>
          <div className={styles.statValue}>{stats.totalVerifiers}</div>
          <div className={styles.statMeta}>{stats.totalCorpus} corpus sources</div>
        </div>
      </div>

      {/* Recent entries + POS breakdown */}
      <div className={styles.sectionGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Recently modified entries</div>
            <div className={styles.panelTag}>date_modified</div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Word</th>
                <th>POS</th>
                <th>Gloss (EN)</th>
                <th>Status</th>
                <th>Modified</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.map((entry) => (
                <tr key={entry.word_id}>
                  <td className={styles.wordCell}>{entry.word_isn}</td>
                  <td>
                    <span className={styles.posTag}>{entry.pos}</span>
                  </td>
                  <td>{entry.word_eng ?? "—"}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        entry.verified ? styles.statusVerified : styles.statusPending
                      }`}
                    >
                      {entry.verified ? "verified" : "pending"}
                    </span>
                  </td>
                  <td className={styles.dateCell}>{formatDate(entry.date_modified)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Entries by part of speech</div>
            <div className={styles.panelTag}>pos</div>
          </div>
          <div>
            {posBreakdown.map((row) => (
              <div className={styles.posRow} key={row.pos}>
                <span className={styles.posLabel}>{row.pos}</span>
                <div className={styles.posBarTrack}>
                  <div
                    className={styles.posBarFill}
                    style={{ width: `${(row.count / maxPosCount) * 100}%` }}
                  />
                </div>
                <span className={styles.posCount}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corpus + verifiers */}
      <div className={styles.sectionGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Corpus sources by type</div>
            <div className={styles.panelTag}>corpus</div>
          </div>
          <div className={styles.miniList}>
            {corpusByType.map((row) => (
              <div className={styles.miniRow} key={row.type}>
                <span className={styles.miniLabel}>{row.type}</span>
                <span className={styles.miniValue}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <div className={styles.panelTitle}>Active verifiers</div>
            <div className={styles.panelTag}>verifiers</div>
          </div>
          <div className={styles.miniList}>
            {recentVerifiers.map((v) => (
              <div className={styles.miniRow} key={v.name}>
                <span className={styles.miniLabel}>{v.name}</span>
                <span className={styles.miniValue}>
                  {v.role ?? "—"}
                  {v.community ? ` · ${v.community}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}