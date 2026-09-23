"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { toolPath, type Tool } from "@/content/tools";
import { CategoryIcon, SearchIcon } from "./icons";

interface SearchableTool {
  slug: Tool["slug"];
  name: string;
  cardDescription: string;
  category: Tool["category"];
}

const MAX_RESULTS = 8;

/** Client-side search across every tool's name, description and category. No external library. */
export function HomeSearch({ tools }: { tools: SearchableTool[] }) {
  const inputId = useId();
  const statusId = useId();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return null;
    return tools.filter((t) => `${t.name} ${t.cardDescription} ${t.category}`.toLowerCase().includes(q)).slice(0, MAX_RESULTS);
  }, [q, tools]);

  return (
    <div role="search" className="relative">
      <label htmlFor={inputId} className="sr-only">
        Search {tools.length} tools
      </label>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id={inputId}
          type="text"
          className="input pl-11"
          placeholder={`Search ${tools.length} tools\u2026`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
          autoComplete="off"
          aria-describedby={statusId}
        />
      </div>

      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {results === null ? "" : results.length === 0 ? "No tools found." : `${results.length} tool${results.length === 1 ? "" : "s"} found.`}
      </div>

      {results !== null ? (
        <div className="card absolute inset-x-0 top-full z-30 mt-2 max-h-[70vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted">No tools found. Try another search.</p>
          ) : (
            <ul>
              {results.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={toolPath(t.slug)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-fg no-underline hover:bg-hover"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hover text-accent">
                      <CategoryIcon category={t.category} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{t.name}</span>
                      <span className="block truncate text-sm text-muted">{t.cardDescription}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
