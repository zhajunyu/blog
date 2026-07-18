import "server-only";

import { getAllPosts } from "@/lib/content";
import { getCategoryLabel, getTagLabel } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { toSearchableText, type SearchIndex } from "@/lib/search";

export async function buildSearchIndex(locale: Locale): Promise<SearchIndex> {
  const posts = await getAllPosts(locale);

  return {
    locale,
    posts: posts.map((post) => ({
      href: post.href,
      title: post.title,
      description: post.description,
      date: post.date,
      readingTime: post.readingTime,
      category: getCategoryLabel(locale, post.category),
      tags: post.tags.map((tag) => getTagLabel(locale, tag)),
      content: toSearchableText(post.body),
    })),
  };
}
