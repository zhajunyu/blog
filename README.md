# Personal Blog

A static-first bilingual personal blog built with Next.js App Router, TypeScript, MDX, Tailwind CSS, and pnpm.

## Stack

- Next.js App Router
- TypeScript
- MDX posts in Git
- Tailwind CSS plus custom editorial CSS
- `pnpm` package management
- Locale-prefixed i18n routes for English and Simplified Chinese

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

`pnpm e2e` runs a production build, starts the built Next.js server, runs Playwright, and stops the server.

## Appearance

The site follows the visitor's system color-scheme preference. There is no manual light/dark toggle.

## Routes

Every public page is locale-prefixed:

```txt
/en
/en/posts
/en/posts/building-this-blog
/en/categories
/en/categories/tech
/en/tags/writing
/en/about
/en/projects
/en/rss.xml

/zh
/zh/posts
/zh/posts/building-this-blog
/zh/categories
/zh/categories/tech
/zh/tags/writing
/zh/about
/zh/projects
/zh/rss.xml
```

The root route redirects to `/en`. Legacy `/blog` routes redirect to `/en/posts`.

Global routes:

```txt
/robots.txt
/sitemap.xml
```

## Writing Posts

Posts live under `content/posts/{locale}/{slug}.mdx`.

```txt
content/posts/en/building-this-blog.mdx
content/posts/zh/building-this-blog.mdx
```

Use the same slug for translated versions of the same post. Missing translations do not fall back; the missing locale route should 404.

```mdx
---
title: "Post title"
description: "Short summary for previews and metadata."
date: "2026-06-23"
category: "tech"
tags: ["next-js", "writing"]
draft: false
---

Post body in MDX.
```

Required frontmatter: `title`, `date`, `category`, and `tags`.

Optional frontmatter: `description`, `updated`, `draft`, and `coverImage`.

Blank descriptions are treated as omitted. Draft posts are visible in development and excluded from production builds.

Reading time is estimated from the post body at 220 words per minute for
space-delimited text and 500 characters per minute for CJK text.

### Code blocks

Add a supported language identifier to fenced code blocks to enable syntax
highlighting:

````mdx
```ts
const published = true;
```
````

Use `text` for diagrams and other content that should remain monochrome. An
unsupported language identifier fails the build so that authoring mistakes are
caught before deployment. Inline code is not syntax highlighted.

## Categories

Every post must have exactly one category. Categories in frontmatter are stable lowercase IDs:

```mdx
category: "tech"
```

Visible labels and category-card descriptions are localized in
`src/lib/dictionaries.ts`.

When adding a new category ID, add its label and description for both locales:

```ts
categoryLabels: {
  "new-category": "New category"
},
categoryDescriptions: {
  "new-category": "A concise description of the writing in this category."
}
```

## Tags

Tags in frontmatter are stable lowercase IDs:

```mdx
tags: ["next-js", "mdx", "writing"]
```

Visible labels are localized in `src/lib/dictionaries.ts`.

When adding a new tag ID, add labels for both locales:

```ts
tagLabels: {
  "new-tag": "New tag"
}
```

## i18n

Core locale config lives in `src/lib/i18n.ts`.

UI dictionaries live in `src/lib/dictionaries.ts`.

Current locales:

```ts
["en", "zh"]
```

Default locale:

```ts
"en"
```

The language switcher in the header links between equivalent locale-prefixed routes. For post, category, and tag detail pages, it preserves the slug when the target locale has matching content and falls back to that locale’s index page when it does not.

## Deployment

Set the production origin:

```bash
NEXT_PUBLIC_SITE_URL=https://blog.xxx.com
```

Vercel will use `pnpm` because `packageManager` is declared in `package.json` and `pnpm-lock.yaml` is committed.

Before deployment, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```
