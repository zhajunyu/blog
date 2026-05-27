# My Blog

Personal blog built with Next.js and Velite, deployed on Vercel.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Content | Velite — build-time MDX from markdown files |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| Dark mode | next-themes |
| Search | Fuse.js (client-side, Cmd+K) |
| Comments | Giscus (GitHub Discussions) |
| RSS | `feed` package (`/feed.xml`) |
| OG Images | next/og (edge-rendered, per-post) |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Writing Posts

Add `.md` files to `content/posts/` with frontmatter:

```md
---
title: "Post Title"
description: "A short description"
date: 2026-05-27
tags: ["tag1", "tag2"]
published: true
---

Write your content here. Code blocks get syntax highlighting.

```

Velite watches for changes during dev and rebuilds the content layer automatically.

## Building

```bash
pnpm build     # velite → search index → next build
pnpm start     # serve production build
```

## Configuration

Edit `src/lib/constants.ts`:

- `SITE` — title, description, author
- `GISCUS` — repo, repoId, category, categoryId (from [giscus.app](https://giscus.app))

Set `NEXT_PUBLIC_SITE_URL` for production (falls back to `http://localhost:3000` in dev).

## Features

- Post pages with syntax highlighting (Shiki, dual light/dark themes)
- Tags with filtered listing pages
- Dark mode toggle (light / dark / system)
- Full-text search with keyboard navigation (Cmd+K, ↑↓, Enter)
- RSS feed at `/feed.xml`
- Sitemap at `/sitemap.xml`
- Dynamic OG images per post
- JSON-LD structured data
- Giscus comments

## Deploy

```bash
vercel --prod
```

Set `NEXT_PUBLIC_SITE_URL` in the Vercel dashboard to your production URL.
