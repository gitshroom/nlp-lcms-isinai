import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.nav}`}>
          <div className={styles.logo}>
            ISINAI<span className={styles.logoDot}>·</span>
          </div>
          <nav>
            <ul className={styles.navLinks}>
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#stack">Stack</a>
              </li>
              <li>
                <a href="#relations">Sense relations</a>
              </li>
              <li>
                <a href="#workflow">Workflow</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={`${styles.wrap} ${styles.heroGrid}`}>
            <div>
              <div className={styles.eyebrow}>Lexicon management system</div>
              <h1 className={styles.h1}>
                Every word, <em>defined</em>,<br />
                linked, and versioned.
              </h1>
              <p className={styles.lede}>
                ISINAI is the editorial backbone for building and maintaining
                structured Filipino-language lexicons — headwords, parts of
                speech, senses, and the relations between them, all in one
                place.
              </p>
              <div className={styles.ctaRow}>
                <Link href="/admin/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
                  Open dashboard →
                </Link>
                <Link href="#stack" className={`${styles.btn} ${styles.btnGhost}`}>
                  View architecture
                </Link>
              </div>
            </div>

            <div className={styles.entryCard}>
              <div className={styles.headword}>isinai</div>
              <div className={styles.pronunciation}>/i.siˈnai/</div>
              <div className={styles.posRow}>
                <span className={styles.posTag}>n.</span>
                <span className={styles.posTag}>system</span>
                <span className={styles.posTag}>v.1</span>
              </div>
              <div className={styles.definition}>
                <span className={styles.num}>1</span>A platform for compiling,
                editing, and cross-referencing dictionary entries with full
                revision history and reviewer workflows.
              </div>
              <div className={styles.definition}>
                <span className={styles.num}>2</span>A relational store of
                word senses, synonyms, antonyms, and morphological variants.
              </div>
              <div className={styles.etymology}>
                <span className={styles.etyLabel}>Built with</span>
                <div className={styles.stackRow}>
                  <span className={styles.stackPill}>Next.js</span>
                  <span className={styles.stackPill}>pnpm</span>
                  <span className={styles.stackPill}>PostgreSQL</span>
                  <span className={styles.stackPill}>TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className={styles.section}>
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>What it handles</h2>
              <div className={styles.tag}>
                From raw headword intake to published, citable entries.
              </div>
            </div>
            <div className={styles.featureGrid}>
              <div className={styles.feature}>
                <div className={styles.gloss}>entries</div>
                <h3>Headword editor</h3>
                <p>
                  Create and revise entries with pronunciation, etymology,
                  usage notes, and example sentences in a single structured
                  form.
                </p>
              </div>
              <div className={styles.feature}>
                <div className={styles.gloss}>taxonomy</div>
                <h3>Part-of-speech tagging</h3>
                <p>
                  Assign parts of speech and morphological categories
                  consistently across the lexicon, with controlled
                  vocabularies.
                </p>
              </div>
              <div className={styles.feature}>
                <div className={styles.gloss}>relations</div>
                <h3>Sense linking</h3>
                <p>
                  Connect synonyms, antonyms, hypernyms, and related senses
                  across entries, building a navigable semantic network.
                </p>
              </div>
              <div className={styles.feature}>
                <div className={styles.gloss}>review</div>
                <h3>Revision history</h3>
                <p>
                  Every edit is tracked. Compare versions, restore prior
                  definitions, and audit who changed what and when.
                </p>
              </div>
              <div className={styles.feature}>
                <div className={styles.gloss}>search</div>
                <h3>Full-text lookup</h3>
                <p>
                  Query entries by headword, sense, tag, or contributor with
                  fast indexed search across the full dataset.
                </p>
              </div>
              <div className={styles.feature}>
                <div className={styles.gloss}>export</div>
                <h3>Structured export</h3>
                <p>
                  Generate JSON or CSV snapshots of the lexicon for downstream
                  NLP pipelines and research use.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SENSE RELATIONS DIAGRAM */}
        <section id="relations" className={styles.section}>
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>Sense relations, mapped</h2>
              <div className={styles.tag}>
                Entries don&apos;t stand alone — ISINAI tracks how meanings
                connect.
              </div>
            </div>
            <svg
              className={styles.relationsSvg}
              viewBox="0 0 1000 280"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
            >
              <title>
                Diagram of sense relations between a central headword and
                related senses
              </title>
              <desc>
                A central node &quot;tahanan&quot; connects via labeled edges
                to &quot;bahay&quot; (synonym), &quot;tirahan&quot; (synonym),
                &quot;pamilya&quot; (related), and &quot;paalis&quot;
                (antonym).
              </desc>

              <line x1="500" y1="140" x2="230" y2="60" stroke="#B5512C" strokeWidth="1.5" />
              <line x1="500" y1="140" x2="230" y2="220" stroke="#B5512C" strokeWidth="1.5" />
              <line x1="500" y1="140" x2="770" y2="60" stroke="#6E7F66" strokeWidth="1.5" />
              <line
                x1="500"
                y1="140"
                x2="770"
                y2="220"
                stroke="#999489"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              <text x="350" y="92" fill="#8C3C1F" fontSize="12" letterSpacing="0.08em">
                synonym
              </text>
              <text x="345" y="188" fill="#8C3C1F" fontSize="12" letterSpacing="0.08em">
                synonym
              </text>
              <text x="635" y="92" fill="#4E5C47" fontSize="12" letterSpacing="0.08em">
                related
              </text>
              <text x="635" y="188" fill="#5A5648" fontSize="12" letterSpacing="0.08em">
                antonym
              </text>

              <g>
                <rect x="420" y="110" width="160" height="60" rx="4" fill="#F0EAE0" stroke="#1D1B16" strokeWidth="1.5" />
                <text x="500" y="135" fill="#1D1B16" fontSize="18" fontWeight="600" textAnchor="middle">
                  tahanan
                </text>
                <text x="500" y="155" fill="#5A5648" fontSize="11" textAnchor="middle">
                  n. · headword
                </text>
              </g>

              <g>
                <rect x="150" y="30" width="160" height="60" rx="4" fill="#F7F3EC" stroke="#D8D2C5" />
                <text x="230" y="55" fill="#1D1B16" fontSize="16" textAnchor="middle">
                  bahay
                </text>
                <text x="230" y="75" fill="#5A5648" fontSize="11" textAnchor="middle">
                  n. · house
                </text>
              </g>

              <g>
                <rect x="150" y="190" width="160" height="60" rx="4" fill="#F7F3EC" stroke="#D8D2C5" />
                <text x="230" y="215" fill="#1D1B16" fontSize="16" textAnchor="middle">
                  tirahan
                </text>
                <text x="230" y="235" fill="#5A5648" fontSize="11" textAnchor="middle">
                  n. · residence
                </text>
              </g>

              <g>
                <rect x="690" y="30" width="160" height="60" rx="4" fill="#F7F3EC" stroke="#D8D2C5" />
                <text x="770" y="55" fill="#1D1B16" fontSize="16" textAnchor="middle">
                  pamilya
                </text>
                <text x="770" y="75" fill="#5A5648" fontSize="11" textAnchor="middle">
                  n. · family
                </text>
              </g>

              <g>
                <rect x="690" y="190" width="160" height="60" rx="4" fill="#F7F3EC" stroke="#D8D2C5" />
                <text x="770" y="215" fill="#1D1B16" fontSize="16" textAnchor="middle">
                  paalis
                </text>
                <text x="770" y="235" fill="#5A5648" fontSize="11" textAnchor="middle">
                  v. · to leave
                </text>
              </g>
            </svg>
          </div>
        </section>

        {/* ARCHITECTURE / STACK */}
        <section id="stack" className={styles.section}>
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>Built on a plain stack</h2>
              <div className={styles.tag}>
                No surprises — a Next.js app, a Postgres database, pnpm for
                packages.
              </div>
            </div>
            <div className={styles.archLayout}>
              <ul className={styles.stackList}>
                <li>
                  <span className={styles.stackName}>Next.js</span>
                  <div>
                    <div className={styles.stackTag}>application</div>
                    <p className={styles.stackDesc}>
                      Server and client rendering for the entry editor,
                      search, and review dashboards.
                    </p>
                  </div>
                </li>
                <li>
                  <span className={styles.stackName}>PostgreSQL</span>
                  <div>
                    <div className={styles.stackTag}>database</div>
                    <p className={styles.stackDesc}>
                      Stores headwords, senses, tags, relations, and the full
                      revision log relationally.
                    </p>
                  </div>
                </li>
                <li>
                  <span className={styles.stackName}>pnpm</span>
                  <div>
                    <div className={styles.stackTag}>package manager</div>
                    <p className={styles.stackDesc}>
                      Fast, disk-efficient installs for the project,
                      initialized with create-next-app.
                    </p>
                  </div>
                </li>
                <li>
                  <span className={styles.stackName}>TypeScript</span>
                  <div>
                    <div className={styles.stackTag}>language</div>
                    <p className={styles.stackDesc}>
                      Typed entry schemas keep the editor, API routes, and
                      database models in sync.
                    </p>
                  </div>
                </li>
              </ul>

              <div className={styles.entryCard} style={{ marginTop: 0 }}>
                <div className={styles.headword} style={{ fontSize: 22 }}>
                  nlp-lexms-isinai
                </div>
                <div className={styles.pronunciation} style={{ fontSize: 13 }}>
                  project root
                </div>
                <div className={`${styles.etymology} ${styles.etymologyNoBorder}`}>
                  <span className={styles.etyLabel}>init command</span>
                  <code className={styles.codeBlock}>
                    pnpm create next-app@latest nlp-lexms-isinai
                  </code>
                  <span className={styles.etyLabel} style={{ marginTop: 14 }}>
                    database url
                  </span>
                  <code className={styles.codeBlock}>
                    postgresql://user:pass@localhost:5432/isinai_lexicon
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="workflow" className={`${styles.section} ${styles.sectionNoBorder}`}>
          <div className={styles.wrap}>
            <div className={styles.sectionHead}>
              <h2>From draft to published entry</h2>
              <div className={styles.tag}>
                The editorial pipeline behind every headword.
              </div>
            </div>
            <div className={styles.flow}>
              <div className={styles.flowStep}>
                <div className={styles.stepNum}>1</div>
                <div>
                  <h3>Draft the headword</h3>
                  <p>
                    A contributor adds a new entry with spelling,
                    pronunciation, and part-of-speech, stored in the{" "}
                    <code>entries</code> table.
                  </p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.stepNum}>2</div>
                <div>
                  <h3>Define each sense</h3>
                  <p>
                    One or more senses are written, each with a definition,
                    usage notes, and example sentences linked via{" "}
                    <code>sense_id</code>.
                  </p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.stepNum}>3</div>
                <div>
                  <h3>Map relations</h3>
                  <p>
                    Synonyms, antonyms, and related terms are linked through
                    the <code>sense_relations</code> table for
                    cross-referencing.
                  </p>
                </div>
              </div>
              <div className={styles.flowStep}>
                <div className={styles.stepNum}>4</div>
                <div>
                  <h3>Review and publish</h3>
                  <p>
                    A reviewer compares revisions, approves changes, and the
                    entry becomes searchable across the lexicon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={`${styles.section} ${styles.ctaSection}`}>
          <div className={styles.wrap}>
            <h2>Start building the lexicon.</h2>
            <p>
              Sign in to the dashboard to add entries, review pending edits,
              and manage sense relations.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/admin/dashboard" className={`${styles.btn} ${styles.btnPrimary}`}>
                Go to dashboard →
              </Link>
              <Link href="#" className={`${styles.btn} ${styles.btnGhost}`}>
                Read documentation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerRow}`}>
          <span>ISINAI — lexicon management system</span>
          <span>next.js · postgresql · pnpm</span>
        </div>
      </footer>
    </div>
  );
}