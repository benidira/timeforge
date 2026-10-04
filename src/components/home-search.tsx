"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, useEffect } from "react";
import { toolPath, type Tool } from "@/content/tools";
import { CategoryIcon, SearchIcon } from "./icons";

interface SearchableTool {
  slug: Tool["slug"];
  name: string;
  cardDescription: string;
  category: Tool["category"];
}

const MAX_RESULTS = 8;

function navigateClient(path: string) {
  if (typeof window === "undefined") return;
  // Prefer window.location for reliability inside unit tests and outside Next App Router mounts.
  // This keeps the behaviour identical to router.push for same-origin navigation.
  window.location.assign(path);
}

/**
 * Premium Homepage Search with / shortcut, ESC to close,
 * Arrow key navigation, Enter to open, and rich empty state.
 */
export function HomeSearch({ tools }: { tools: SearchableTool[] }) {
  const inputId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    return tools
      .filter((t) =>
        `${t.name} ${t.cardDescription} ${t.category} ${t.slug}`
          .toLowerCase()
          .includes(q)
      )
      .slice(0, MAX_RESULTS);
  }, [q, tools]);

  // Global '/' keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement !== inputRef.current &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName || ""
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
      return;
    }

    if (!results || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetTool = results[selectedIndex] || results[0];
      if (targetTool) {
        navigateClient(toolPath(targetTool.slug));
      }
    }
  };

  return (
    <div role="search" className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        Search {tools.length} tools
      </label>
      <div className="relative group">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-accent" />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className="input pl-11 pr-20 py-3.5 text-base sm:text-lg rounded-xl shadow-lg border-line/80 focus:border-accent bg-card/90 backdrop-blur-md"
          placeholder="Search 25+ free tools... (Press '/' to focus)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onFocus={() => {
            void q;
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-describedby={statusId}
        />
        <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="hidden sm:inline-flex items-center justify-center h-5 w-5 rounded border border-line bg-hover text-[11px] font-mono text-muted">
            /
          </kbd>
        </div>
      </div>

      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {results === null
          ? ""
          : results.length === 0
          ? "No tools found."
          : `${results.length} tool${results.length === 1 ? "" : "s"} found.`}
      </div>

      {results !== null ? (
        <div className="card absolute inset-x-0 top-full z-40 mt-2 max-h-[65vh] overflow-y-auto p-2 shadow-2xl border-line/90 bg-card/98 backdrop-blur-xl">
          {results.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-fg">No tools matching &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-muted">
                Try searching for &ldquo;timestamp&rdquo;, &ldquo;cron&rdquo;, &ldquo;iso&rdquo;, or &ldquo;timezone&rdquo;.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((t, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li key={t.slug}>
                    <Link
                      href={toolPath(t.slug)}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 no-underline transition-colors ${
                        isSelected
                          ? "bg-hover text-fg ring-1 ring-accent/40"
                          : "text-fg hover:bg-hover"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hover text-accent">
                          <CategoryIcon category={t.category} />
                        </span>
                        <div className="min-w-0">
                          <span className="block truncate font-medium text-sm sm:text-base">
                            {t.name}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {t.cardDescription}
                          </span>
                        </div>
                      </div>
                      <span className="hidden sm:inline-flex shrink-0 items-center rounded-md bg-hover px-2 py-0.5 text-xs text-muted">
                        {t.category}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
