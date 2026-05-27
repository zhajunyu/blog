"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { useSearch } from "@/components/search/search-provider";

interface SearchItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

export function SearchDialog() {
  const { open, closeSearch } = useSearch();
  const router = useRouter();
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => {});
  }, []);

  const fuseRef = useRef<Fuse<SearchItem> | null>(null);

  useEffect(() => {
    if (index.length > 0) {
      fuseRef.current = new Fuse(index, {
        keys: ["title", "description", "tags"],
        threshold: 0.4,
      });
    }
  }, [index]);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (!q.trim() || !fuseRef.current) {
        setResults(index.slice(0, 5));
        return;
      }
      setResults(fuseRef.current.search(q).map((r) => r.item));
    },
    [index],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(index.slice(0, 5));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, index]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeSearch]);

  const navigate = (slug: string) => {
    closeSearch();
    router.push(`/posts/${slug}`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={closeSearch}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search posts..."
          className="w-full px-4 py-4 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground outline-none text-lg"
        />
        <ul className="max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-muted-foreground text-sm">
              No results
            </li>
          ) : (
            results.map((item) => (
              <li key={item.slug}>
                <button
                  onClick={() => navigate(item.slug)}
                  className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                >
                  <div className="font-medium text-foreground">
                    {item.title}
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-0.5">
                    {item.description}
                  </div>
                  <div className="flex gap-1.5 mt-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex justify-between">
          <span>Type to search</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
