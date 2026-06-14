"use client";

import { useEffect, useRef, useState } from "react";
import extra from "./data-entry-extra.module.css";
import { searchVerifiers, type VerifierSearchResult } from "@/app/actions/verifiers";

const DEBOUNCE_MS = 250;

export default function VerifierSearchSelect({
  onSelect,
  selectedLabel,
  onClear,
}: {
  onSelect: (verifierId: number) => void;
  selectedLabel: string | null;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VerifierSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!trimmedQuery) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await searchVerifiers(trimmedQuery);
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

  function handleSelect(result: VerifierSearchResult) {
    onSelect(result.verifier_id);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  const isOpen = open && trimmedQuery.length > 0;
  const visibleResults = trimmedQuery.length > 0 ? results : [];

  return (
    <div className={extra.searchBar}>
      <div className={extra.searchInputWrap} ref={containerRef}>
        <input
          type="text"
          className={extra.searchInput}
          placeholder="Search by name, role, or community…"
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
              <div className={extra.searchEmpty}>No matching verifiers.</div>
            ) : (
              visibleResults.map((r) => (
                <div
                  key={r.verifier_id}
                  className={extra.searchResultItem}
                  onClick={() => handleSelect(r)}
                >
                  <span className={extra.searchResultWord}>{r.name}</span>
                  <span className={extra.searchResultMeta}>
                    {r.role ?? "—"}
                    {r.community ? ` · ${r.community}` : ""}
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
            New verifier instead
          </button>
        </>
      ) : (
        <span className={`${extra.modeBadge} ${extra.modeBadgeCreate}`}>New verifier</span>
      )}
    </div>
  );
}