"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./data-entry.module.css";
import extra from "./data-entry-extra.module.css";
import { searchWords, type WordSearchResult } from "@/app/actions/words";

const DEBOUNCE_MS = 250;

export default function WordSearchSelect({
  onSelect,
  selectedLabel,
  onClear,
}: {
  onSelect: (wordId: number) => void;
  selectedLabel: string | null;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WordSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Nothing to search — clear any pending timer and bail out.
    // (The empty-query UI state is derived at render time below,
    // not set synchronously here.)
    if (!trimmedQuery) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await searchWords(trimmedQuery);
        setResults(rows);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [trimmedQuery]);

  // Close dropdown on outside click.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(result: WordSearchResult) {
    onSelect(result.word_id);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  // Derived: when the query is empty, treat the dropdown as closed
  // and the result list as empty — no setState needed for this case.
  const isOpen = open && trimmedQuery.length > 0;
  const visibleResults = trimmedQuery.length > 0 ? results : [];

  return (
    <div className={extra.searchBar}>
      <div className={extra.searchInputWrap} ref={containerRef}>
        <input
          type="text"
          className={extra.searchInput}
          placeholder="Search by headword, English, or Tagalog gloss…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (visibleResults.length > 0) setOpen(true);
          }}
        />
        {isOpen && (
          <div className={extra.searchResults}>
            {loading ? (
              <div className={extra.searchEmpty}>Searching…</div>
            ) : visibleResults.length === 0 ? (
              <div className={extra.searchEmpty}>No matching entries.</div>
            ) : (
              visibleResults.map((r) => (
                <div
                  key={r.word_id}
                  className={extra.searchResultItem}
                  onClick={() => handleSelect(r)}
                >
                  <span className={extra.searchResultWord}>
                    {r.word_isn}
                    {r.word_eng ? ` — ${r.word_eng}` : ""}
                  </span>
                  <span className={extra.searchResultMeta}>
                    {r.pos} · {r.verified ? "verified" : "pending"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedLabel ? (
        <>
          <span className={`${extra.modeBadge} ${extra.modeBadgeEdit}`}>
            Editing: {selectedLabel}
          </span>
          <button type="button" className={extra.clearBtn} onClick={onClear}>
            New entry instead
          </button>
        </>
      ) : (
        <span className={`${extra.modeBadge} ${extra.modeBadgeCreate}`}>New entry</span>
      )}
    </div>
  );
}