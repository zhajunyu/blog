"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import {
  getHighlightedSearchSegments,
  searchPosts,
  type SearchIndex,
} from "@/lib/search";

interface SearchDialogProps {
  locale: Locale;
  messages: Dictionary["search"];
}

type SearchIndexStatus = "idle" | "loading" | "ready" | "error";

const closeAnimationDurationMs = 220;
const searchIndexRequests = new Map<Locale, Promise<SearchIndex>>();
const dateFormatters: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }),
  zh: new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }),
};

export function SearchDialog({ locale, messages }: SearchDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<number | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState<SearchIndex>();
  const [indexStatus, setIndexStatus] = useState<SearchIndexStatus>("idle");
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const deferredQuery = useDeferredValue(query);
  const titleId = useId();
  const resultsId = useId();
  const results = useMemo(
    () => searchPosts(searchIndex?.posts ?? [], deferredQuery, locale),
    [deferredQuery, locale, searchIndex],
  );

  const loadIndex = useCallback(
    async (forceReload = false) => {
      setIndexStatus("loading");

      if (forceReload) {
        searchIndexRequests.delete(locale);
      }

      try {
        const index = await requestSearchIndex(locale);

        setSearchIndex(index);
        setIndexStatus("ready");
      } catch {
        setIndexStatus("error");
      }
    },
    [locale],
  );

  const cancelScheduledClose = useCallback(() => {
    if (closeTimeoutRef.current !== undefined) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = undefined;
    }

    if (dialogRef.current) {
      delete dialogRef.current.dataset.closing;
    }
  }, []);

  const openSearch = useCallback(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    cancelScheduledClose();

    if (!dialog.open) {
      dialog.showModal();
      setIsOpen(true);
    }

    inputRef.current?.focus();
    void loadIndex();
  }, [cancelScheduledClose, loadIndex]);

  const closeSearch = useCallback(() => {
    const dialog = dialogRef.current;

    if (!dialog?.open || dialog.dataset.closing === "true") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }

    dialog.dataset.closing = "true";
    closeTimeoutRef.current = window.setTimeout(() => {
      closeTimeoutRef.current = undefined;
      dialog.close();
    }, closeAnimationDurationMs);
  }, []);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current !== undefined) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [openSearch]);

  useEffect(() => {
    if (!isOpen || results.length === 0) {
      return;
    }

    document
      .getElementById(`${resultsId}-option-${activeResultIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeResultIndex, isOpen, results.length, resultsId]);

  function handleDialogClose() {
    cancelScheduledClose();
    setIsOpen(false);
    setQuery("");
    setActiveResultIndex(0);
    triggerRef.current?.focus();
  }

  function handleDialogClick(event: ReactMouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeSearch();
    }
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveResultIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveResultIndex((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const activeResult = results[activeResultIndex];

      if (activeResult) {
        closeSearch();
        router.push(activeResult.post.href);
      }
    }
  }

  function handleResultClick() {
    closeSearch();
  }

  const hasQuery = deferredQuery.trim().length > 0;
  const activeDescendant =
    hasQuery && results[activeResultIndex]
      ? `${resultsId}-option-${activeResultIndex}`
      : undefined;

  return (
    <div className="search-control">
      <button
        ref={triggerRef}
        className="header-icon-control search-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={messages.openLabel}
        onClick={openSearch}
      >
        <Search aria-hidden="true" size={22} strokeWidth={1.8} />
      </button>

      <dialog
        ref={dialogRef}
        className="search-dialog"
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          closeSearch();
        }}
        onClick={handleDialogClick}
        onClose={handleDialogClose}
      >
        <div className="search-dialog-panel">
          <div className="search-dialog-heading">
            <div>
              <p className="search-dialog-kicker">{messages.shortcut}</p>
              <h2 id={titleId}>{messages.title}</h2>
            </div>
            <button
              className="search-dialog-close"
              type="button"
              aria-label={messages.closeLabel}
              onClick={closeSearch}
            >
              <X aria-hidden="true" size={22} strokeWidth={1.8} />
            </button>
          </div>

          <div className="search-input-shell">
            <Search aria-hidden="true" size={23} strokeWidth={1.7} />
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-activedescendant={activeDescendant}
              aria-autocomplete="list"
              aria-controls={resultsId}
              aria-expanded={hasQuery && indexStatus === "ready"}
              aria-label={messages.inputLabel}
              autoComplete="off"
              placeholder={messages.placeholder}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveResultIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
            />
            <kbd aria-hidden="true">Esc</kbd>
          </div>

          <div className="search-dialog-content" aria-live="polite">
            <SearchContent
              activeResultIndex={activeResultIndex}
              deferredQuery={deferredQuery}
              indexStatus={indexStatus}
              locale={locale}
              messages={messages}
              results={results}
              resultsId={resultsId}
              onResultClick={handleResultClick}
              onResultHover={setActiveResultIndex}
              onRetry={() => void loadIndex(true)}
            />
          </div>
        </div>
      </dialog>
    </div>
  );
}

interface SearchContentProps {
  activeResultIndex: number;
  deferredQuery: string;
  indexStatus: SearchIndexStatus;
  locale: Locale;
  messages: Dictionary["search"];
  results: ReturnType<typeof searchPosts>;
  resultsId: string;
  onResultClick: () => void;
  onResultHover: (index: number) => void;
  onRetry: () => void;
}

function SearchContent({
  activeResultIndex,
  deferredQuery,
  indexStatus,
  locale,
  messages,
  results,
  resultsId,
  onResultClick,
  onResultHover,
  onRetry,
}: SearchContentProps) {
  const trimmedQuery = deferredQuery.trim();

  if (indexStatus === "error") {
    return (
      <div className="search-message search-error-message">
        <p>{messages.error}</p>
        <button type="button" onClick={onRetry}>
          {messages.retry}
        </button>
      </div>
    );
  }

  if (!trimmedQuery) {
    return <p className="search-message">{messages.prompt}</p>;
  }

  if (indexStatus === "idle" || indexStatus === "loading") {
    return <p className="search-message">{messages.loading}</p>;
  }

  if (results.length === 0) {
    return (
      <p className="search-message">
        {messages.noResults.replace("{query}", trimmedQuery)}
      </p>
    );
  }

  return (
    <>
      <p className="search-result-count">
        {messages.resultCount.replace("{count}", String(results.length))}
      </p>
      <ol id={resultsId} className="search-results" role="listbox" aria-label={messages.resultListLabel}>
        {results.map((result, index) => {
          const isActive = index === activeResultIndex;
          const optionId = `${resultsId}-option-${index}`;

          return (
            <li key={result.post.href} role="presentation">
              <Link
                id={optionId}
                className="search-result-link"
                href={result.post.href}
                role="option"
                aria-selected={isActive}
                data-active={isActive ? "true" : "false"}
                onClick={onResultClick}
                onMouseMove={() => onResultHover(index)}
              >
                <span className="search-result-meta">
                  <span>{result.post.category}</span>
                  <time dateTime={result.post.date}>
                    {dateFormatters[locale].format(new Date(`${result.post.date}T00:00:00.000Z`))}
                  </time>
                  <span>{result.post.readingTime}</span>
                </span>
                <span className="search-result-title">
                  <HighlightedText text={result.post.title} query={deferredQuery} locale={locale} />
                </span>
                <span className="search-result-snippet">
                  <HighlightedText text={result.snippet} query={deferredQuery} locale={locale} />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}

interface HighlightedTextProps {
  text: string;
  query: string;
  locale: Locale;
}

function HighlightedText({ text, query, locale }: HighlightedTextProps) {
  return getHighlightedSearchSegments(text, query, locale).map((segment, index) =>
    segment.highlighted ? (
      <mark key={`${segment.text}-${index}`}>{segment.text}</mark>
    ) : (
      segment.text
    ),
  );
}

function requestSearchIndex(locale: Locale) {
  const cachedRequest = searchIndexRequests.get(locale);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = fetch(`/${locale}/search-index.json`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Search index request failed with ${response.status}`);
      }

      const value: unknown = await response.json();

      if (!isSearchIndex(value) || value.locale !== locale) {
        throw new Error("Search index response was invalid");
      }

      return value;
    })
    .catch((error: unknown) => {
      searchIndexRequests.delete(locale);
      throw error;
    });

  searchIndexRequests.set(locale, request);
  return request;
}

function isSearchIndex(value: unknown): value is SearchIndex {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SearchIndex>;

  return (
    (candidate.locale === "en" || candidate.locale === "zh") &&
    Array.isArray(candidate.posts) &&
    candidate.posts.every(
      (post) =>
        post &&
        typeof post.href === "string" &&
        typeof post.title === "string" &&
        typeof post.date === "string" &&
        typeof post.readingTime === "string" &&
        typeof post.category === "string" &&
        Array.isArray(post.tags) &&
        post.tags.every((tag) => typeof tag === "string") &&
        typeof post.content === "string" &&
        (post.description === undefined || typeof post.description === "string"),
    )
  );
}
