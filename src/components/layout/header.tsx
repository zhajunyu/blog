"use client";

import Link from "next/link";
import { Tag, Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useSearch } from "@/components/search/search-provider";

export function Header() {
  const { openSearch } = useSearch();

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-lg hover:opacity-70 transition-opacity"
        >
          My Blog
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/tags"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Tag size={14} />
            Tags
          </Link>
          <button
            onClick={openSearch}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Search size={14} />
            Search
          </button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
