import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { cache } from "react";
import { z } from "zod";

import {
  getCategoryDescription,
  getCategoryIds,
  getCategoryLabel,
  getTagLabel,
} from "@/lib/dictionaries";
import {
  formatDisplayDate,
  formatReadingTime,
  localizedPath,
  type Locale,
} from "@/lib/i18n";

const postsRootDirectory = path.join(process.cwd(), "content", "posts");

const optionalTextSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const tagIdSchema = z
  .string()
  .trim()
  .regex(stableIdPattern, "Use a stable lowercase tag id");

const categoryIdSchema = z
  .string()
  .trim()
  .regex(stableIdPattern, "Use a stable lowercase category id");

const frontmatterSchema = z.object({
  title: z.string().trim().min(1),
  description: optionalTextSchema,
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  category: categoryIdSchema,
  tags: z.array(tagIdSchema).default([]),
  draft: z.boolean().default(false),
  coverImage: z.string().trim().optional(),
});

export interface Post {
  locale: Locale;
  slug: string;
  href: string;
  title: string;
  description?: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  draft: boolean;
  coverImage?: string;
  readingTime: string;
  body: string;
}

export interface TagSummary {
  id: string;
  slug: string;
  name: string;
  count: number;
}

export interface CategorySummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  count: number;
}

export interface PostHeading {
  id: string;
  level: 2 | 3 | 4;
  title: string;
}

interface GetPostsOptions {
  includeDrafts?: boolean;
}

export function parsePostFile(
  locale: Locale,
  slug: string,
  fileContents: string,
): Post {
  assertSafeSlug(slug);

  const { content, data } = matter(fileContents);
  const result = frontmatterSchema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid frontmatter in ${locale}/${slug}.mdx: ${issues}`);
  }

  const frontmatter = result.data;

  return {
    locale,
    slug,
    href: localizedPath(locale, `/posts/${slug}`),
    title: frontmatter.title,
    description: frontmatter.description,
    date: toDateString(frontmatter.date),
    updated: frontmatter.updated ? toDateString(frontmatter.updated) : undefined,
    category: frontmatter.category,
    tags: frontmatter.tags,
    draft: frontmatter.draft,
    coverImage: frontmatter.coverImage,
    readingTime: formatReadingTime(estimateReadingTimeMinutes(content), locale),
    body: content.trim(),
  };
}

export const getPostBySlug = cache(async (locale: Locale, slug: string) => {
  assertSafeSlug(slug);

  const filePath = path.join(postsRootDirectory, locale, `${slug}.mdx`);
  const fileContents = await fs.readFile(filePath, "utf8");

  return parsePostFile(locale, slug, fileContents);
});

export async function getAllPosts(
  locale: Locale,
  options: GetPostsOptions = {},
) {
  const slugs = await getPostSlugs(locale);
  const posts = await Promise.all(slugs.map((slug) => getPostBySlug(locale, slug)));
  const includeDrafts = options.includeDrafts ?? process.env.NODE_ENV !== "production";

  return sortPosts(posts).filter((post) => includeDrafts || !post.draft);
}

export async function getPostsByTag(locale: Locale, tagSlug: string) {
  const posts = await getAllPosts(locale);

  return posts.filter((post) => post.tags.includes(tagSlug));
}

export async function getPostsByCategory(locale: Locale, categorySlug: string) {
  const posts = await getAllPosts(locale);

  return posts.filter((post) => post.category === categorySlug);
}

export async function getAllTags(locale: Locale): Promise<TagSummary[]> {
  const posts = await getAllPosts(locale);

  return summarizeTags(locale, posts);
}

export async function getAllCategories(locale: Locale): Promise<CategorySummary[]> {
  const posts = await getAllPosts(locale);

  return summarizeCategories(locale, posts);
}

function summarizeTags(locale: Locale, posts: Post[]): TagSummary[] {
  const tags = new Map<string, TagSummary>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const current = tags.get(tag);

      tags.set(tag, {
        id: tag,
        slug: tag,
        name: current?.name ?? getTagLabel(locale, tag),
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return [...tags.values()].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.name.localeCompare(right.name);
  });
}

function summarizeCategories(locale: Locale, posts: Post[]): CategorySummary[] {
  const categories = new Map<string, CategorySummary>(
    getCategoryIds(locale).map((id) => [
      id,
      {
        id,
        slug: id,
        name: getCategoryLabel(locale, id),
        description: getCategoryDescription(locale, id),
        count: 0,
      },
    ]),
  );

  for (const post of posts) {
    const current = categories.get(post.category);

    categories.set(post.category, {
      id: post.category,
      slug: post.category,
      name: current?.name ?? getCategoryLabel(locale, post.category),
      description:
        current?.description ?? getCategoryDescription(locale, post.category),
      count: (current?.count ?? 0) + 1,
    });
  }

  return [...categories.values()];
}

export const getContentAvailability = cache(async () => {
  const [enPosts, zhPosts] = await Promise.all([
    getAllPosts("en", { includeDrafts: process.env.NODE_ENV !== "production" }),
    getAllPosts("zh", { includeDrafts: process.env.NODE_ENV !== "production" }),
  ]);
  const enTags = summarizeTags("en", enPosts).map((tag) => tag.slug);
  const zhTags = summarizeTags("zh", zhPosts).map((tag) => tag.slug);
  const enCategories = summarizeCategories("en", enPosts).map(
    (category) => category.slug,
  );
  const zhCategories = summarizeCategories("zh", zhPosts).map(
    (category) => category.slug,
  );

  return {
    posts: {
      en: enPosts.map((post) => post.slug),
      zh: zhPosts.map((post) => post.slug),
    },
    tags: {
      en: enTags,
      zh: zhTags,
    },
    categories: {
      en: enCategories,
      zh: zhCategories,
    },
  };
});

export async function getPostSlugs(locale: Locale) {
  try {
    const files = await fs.readdir(path.join(postsRootDirectory, locale));

    return files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(/\.mdx$/, ""))
      .filter(isSafeSlug)
      .sort();
  } catch (error) {
    if (isMissingDirectoryError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getTagSlugs(locale: Locale) {
  const tags = await getAllTags(locale);

  return tags.map((tag) => tag.slug);
}

export async function getCategorySlugs(locale: Locale) {
  const categories = await getAllCategories(locale);

  return categories.map((category) => category.slug);
}

export function getTagSlug(tag: string) {
  return getTaxonomySlug(tag);
}

export function getCategorySlug(category: string) {
  return getTaxonomySlug(category);
}

function getTaxonomySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPostHeadings(content: string): PostHeading[] {
  const createId = createHeadingIdFactory();
  const headings: PostHeading[] = [];
  let fence: { marker: string; size: number } | undefined;

  for (const line of content.split(/\r?\n/)) {
    const fenceMarker = line.match(/^\s{0,3}(`{3,}|~{3,})/);

    if (fenceMarker) {
      const marker = fenceMarker[1];

      if (!fence) {
        fence = { marker: marker[0], size: marker.length };
      } else if (marker.startsWith(fence.marker) && marker.length >= fence.size) {
        fence = undefined;
      }

      continue;
    }

    if (fence) {
      continue;
    }

    const match = line.match(/^\s{0,3}(#{2,4})\s+(.+?)\s*#*\s*$/);

    if (!match) {
      continue;
    }

    const title = normalizeHeadingTitle(match[2]);

    if (!title) {
      continue;
    }

    headings.push({
      id: createId(title),
      level: match[1].length as PostHeading["level"],
      title,
    });
  }

  return headings;
}

export function hasLayeredPostHeadings(headings: readonly PostHeading[]) {
  return new Set(headings.map((heading) => heading.level)).size > 1;
}

export function sortPosts(posts: Post[]) {
  return [...posts].sort((left, right) => {
    const byDate = right.date.localeCompare(left.date);

    if (byDate !== 0) {
      return byDate;
    }

    return left.title.localeCompare(right.title);
  });
}

export function filterDrafts(posts: Post[], includeDrafts: boolean) {
  return posts.filter((post) => includeDrafts || !post.draft);
}

export { formatDisplayDate };

function estimateReadingTimeMinutes(content: string) {
  const text = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createHeadingIdFactory() {
  const seen = new Map<string, number>();

  return (title: string) => {
    const slug = getHeadingSlug(title);
    const count = seen.get(slug) ?? 0;

    seen.set(slug, count + 1);

    return count === 0 ? slug : `${slug}-${count}`;
  };
}

function getHeadingSlug(title: string) {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "section";
}

function normalizeHeadingTitle(title: string) {
  return title
    .replace(/<[^>]+>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\\([\\`*{}[\]()#+\-.!_>])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function assertSafeSlug(slug: string) {
  if (!isSafeSlug(slug)) {
    throw new Error(`Invalid post slug: ${slug}`);
  }
}

function isSafeSlug(slug: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function isMissingDirectoryError(error: unknown): error is NodeJS.ErrnoException {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
