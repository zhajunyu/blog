import type { Locale } from "@/lib/i18n";

export interface SearchIndexPost {
  href: string;
  title: string;
  description?: string;
  date: string;
  readingTime: string;
  category: string;
  tags: string[];
  content: string;
}

export interface SearchIndex {
  locale: Locale;
  posts: SearchIndexPost[];
}

export interface SearchResult {
  post: SearchIndexPost;
  score: number;
  snippet: string;
}

export interface HighlightedSearchSegment {
  text: string;
  highlighted: boolean;
}

const snippetLength = 190;
const snippetContextBeforeMatch = 62;

export function normalizeSearchText(value: string, locale: Locale) {
  return value.normalize("NFKC").toLocaleLowerCase(locale).replace(/\s+/g, " ").trim();
}

export function getSearchTerms(query: string, locale: Locale) {
  const normalizedQuery = normalizeSearchText(query, locale);

  return normalizedQuery ? normalizedQuery.split(" ").filter(Boolean) : [];
}

export function toSearchableText(markdown: string) {
  return markdown
    .replace(/\r\n?/g, "\n")
    .replace(/^\s{0,3}(`{3,}|~{3,}).*$/gm, " ")
    .replace(/<[^>]+>/g, (tag) => {
      const titles = [...tag.matchAll(/\btitle=["']([^"']+)["']/gi)];

      return titles.map((match) => match[1]).join(" ");
    })
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s*[-+*]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[`*_~]+/g, "")
    .replace(/[|{}]/g, " ")
    .replace(/\\([\\`*{}[\]()#+\-.!_>])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchPosts(
  posts: readonly SearchIndexPost[],
  query: string,
  locale: Locale,
): SearchResult[] {
  const terms = getSearchTerms(query, locale);

  if (terms.length === 0) {
    return [];
  }

  const results = posts.flatMap((post) => {
    const normalizedFields = {
      title: normalizeSearchText(post.title, locale),
      description: normalizeSearchText(post.description ?? "", locale),
      taxonomy: normalizeSearchText([post.category, ...post.tags].join(" "), locale),
      content: normalizeSearchText(post.content, locale),
    };
    let score = 0;

    for (const term of terms) {
      if (normalizedFields.title.includes(term)) {
        score += 100;
      } else if (normalizedFields.description.includes(term)) {
        score += 45;
      } else if (normalizedFields.taxonomy.includes(term)) {
        score += 25;
      } else if (normalizedFields.content.includes(term)) {
        score += 10;
      } else {
        return [];
      }
    }

    const normalizedQuery = terms.join(" ");

    if (normalizedFields.title === normalizedQuery) {
      score += 120;
    } else if (normalizedFields.title.startsWith(normalizedQuery)) {
      score += 60;
    }

    return [
      {
        post,
        score,
        snippet: createSearchSnippet(post, terms, locale),
      },
    ];
  });

  return results.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    const byDate = right.post.date.localeCompare(left.post.date);

    return byDate || left.post.title.localeCompare(right.post.title, locale);
  });
}

export function getHighlightedSearchSegments(
  text: string,
  query: string,
  locale: Locale,
): HighlightedSearchSegment[] {
  const terms = getSearchTerms(query, locale).sort((left, right) => right.length - left.length);

  if (terms.length === 0) {
    return [{ text, highlighted: false }];
  }

  const escapedTerms = terms.map(escapeRegExp);
  const expression = new RegExp(`(${escapedTerms.join("|")})`, "giu");

  return text.split(expression).filter(Boolean).map((segment) => ({
    text: segment,
    highlighted: terms.includes(normalizeSearchText(segment, locale)),
  }));
}

function createSearchSnippet(
  post: SearchIndexPost,
  terms: readonly string[],
  locale: Locale,
) {
  const contentMatch = findFirstTermIndex(post.content, terms, locale);
  const descriptionMatch = findFirstTermIndex(post.description ?? "", terms, locale);
  const source = contentMatch >= 0 ? post.content : (post.description ?? post.content);
  const matchIndex = contentMatch >= 0 ? contentMatch : descriptionMatch;

  if (source.length <= snippetLength) {
    return source;
  }

  const rawStart = matchIndex >= 0 ? Math.max(0, matchIndex - snippetContextBeforeMatch) : 0;
  const rawEnd = Math.min(source.length, rawStart + snippetLength);
  const start = findSnippetStart(source, rawStart, locale);
  const end = findSnippetEnd(source, rawEnd, locale);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < source.length ? "…" : "";

  return `${prefix}${source.slice(start, end).trim()}${suffix}`;
}

function findFirstTermIndex(text: string, terms: readonly string[], locale: Locale) {
  const normalizedText = normalizeSearchText(text, locale);
  let firstIndex = -1;

  for (const term of terms) {
    const index = normalizedText.indexOf(term);

    if (index >= 0 && (firstIndex < 0 || index < firstIndex)) {
      firstIndex = index;
    }
  }

  return firstIndex;
}

function findSnippetStart(text: string, rawStart: number, locale: Locale) {
  if (rawStart === 0 || locale === "zh") {
    return rawStart;
  }

  const nextSpace = text.indexOf(" ", rawStart);

  return nextSpace >= 0 && nextSpace - rawStart < 24 ? nextSpace + 1 : rawStart;
}

function findSnippetEnd(text: string, rawEnd: number, locale: Locale) {
  if (rawEnd === text.length || locale === "zh") {
    return rawEnd;
  }

  const previousSpace = text.lastIndexOf(" ", rawEnd);

  return previousSpace > rawEnd - 24 ? previousSpace : rawEnd;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
