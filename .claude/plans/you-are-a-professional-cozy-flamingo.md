# Personal Blog — Implementation Plan

## Context

Greenfield personal blog. Write posts as Markdown files in the repo, render with Next.js SSR/Hybrid on Vercel. Must-haves: dark mode, tags/categories, code syntax highlighting, RSS + SEO + OG metadata, comments, search.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-------|
| Framework | **Next.js 16** (App Router) | User's choice. SSR + SSG hybrid. |
| Language | **TypeScript 5.8** | Type safety across content and components. |
| Content | **Velite 0.3** | Build-time MDX processing. Generates typed JSON. Better than unmaintained Contentlayer. |
| Styling | **Tailwind CSS v4** + `@tailwindcss/typography` | CSS-first config, `prose` class for article styling. |
| Dark mode | **next-themes** | SSR-safe, persistence, no hydration flash. |
| Code highlighting | **rehype-pretty-code** (Shiki) | Plugs into Velite's rehype pipeline. Dual light/dark themes. |
| Search | **Fuse.js** (client-side) | No backend, no cost. Fuzzy search over post metadata at runtime. |
| Comments | **Giscus** | Free, GitHub Discussions-backed, comments live in user's repo. |
| RSS | **feed** package | Build-time RSS 2.0 + Atom feed generation via route handler. |
| OG Images | **next/og** (Satori) | Dynamic OG image generation per post, edge-cached on Vercel. |
| Hosting | **Vercel** | Zero-config Next.js deployment, generous free tier. |

## Project Structure

```
blog/
├── content/posts/              # Markdown posts with YAML frontmatter
│   └── hello-world.md
├── public/
│   ├── favicon.ico
│   └── search-index.json       # Generated at build time for client-side search
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout: ThemeProvider, Header, Footer
│   │   ├── page.tsx            # Home — post list (SSG)
│   │   ├── not-found.tsx
│   │   ├── posts/[slug]/
│   │   │   ├── page.tsx        # Single post (SSG + generateStaticParams)
│   │   │   └── opengraph-image.tsx  # Dynamic OG image per post
│   │   ├── tags/
│   │   │   ├── page.tsx        # Tag index (SSG)
│   │   │   └── [tag]/page.tsx  # Posts by tag (SSG)
│   │   ├── feed.xml/route.ts   # RSS/Atom feed (static)
│   │   └── sitemap.ts          # Sitemap (Next.js built-in)
│   ├── components/
│   │   ├── layout/             # Header, Footer, ThemeToggle
│   │   ├── post/               # PostCard, PostList, PostHeader, PostBody, PostNavigation, TagBadge
│   │   ├── search/             # SearchProvider, SearchDialog
│   │   └── comments/           # GiscusComments
│   ├── lib/
│   │   ├── velite.ts           # Data access: getPosts, getPost, getTags, getPostsByTag
│   │   ├── constants.ts        # Site title, URL, author name
│   │   └── search.ts           # Build-time search index generator
│   └── styles/globals.css      # Tailwind v4 + prose + code block overrides
├── velite.config.ts            # Content collections, schemas, rehype plugins
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Route Design

| Route | Strategy | Notes |
|-------|----------|-------|
| `/` | SSG | All published posts, sorted by date |
| `/posts/[slug]` | SSG + optional ISR | Full post, metadata, comments |
| `/tags` | SSG | Tag cloud with counts |
| `/tags/[tag]` | SSG | Filtered post list |
| `/feed.xml` | SSG (`force-static`) | RSS 2.0 feed |
| `/sitemap.xml` | SSG | Next.js built-in `sitemap.ts` |
| `/posts/[slug]/opengraph-image` | Dynamic SSR | Cached at edge after first request |

## Implementation Phases

### Phase 1: Scaffolding
- `pnpm create next-app@latest` with TypeScript, Tailwind, App Router, src dir
- Upgrade to Tailwind v4 (CSS-first config)
- Install all dependencies
- Configure tsconfig path alias for `.velite/generated/`

### Phase 2: Content Layer
- Write `velite.config.ts` with Post collection schema, rehype-pretty-code, remark-gfm
- Write `src/lib/velite.ts` data access helpers
- Add dev/build scripts (`velite --watch` + `next dev` concurrently)
- Create 2-3 sample posts
- **Verify**: `npx velite` generates `.velite/` output

### Phase 3: Core Pages
- Root layout with ThemeProvider, Header, Footer
- Home page (post list), Post page (with generateStaticParams + generateMetadata)
- Tags index and tag-filtered post list
- PostBody component (renders velite HTML output with `prose` class)
- **Verify**: `pnpm build` succeeds, all routes render

### Phase 4: Dark Mode & Code Highlighting
- ThemeToggle component (useTheme from next-themes)
- `@tailwindcss/typography` plugin for prose styling
- Code block CSS overrides (rounded, background, font size)
- **Verify**: Toggle dark mode, code blocks change theme, prose looks good

### Phase 5: SEO, RSS, Sitemap, OG Images
- Per-post generateMetadata (OpenGraph, Twitter, canonical)
- JSON-LD structured data in post pages
- `sitemap.ts` with all post URLs + static routes
- `feed.xml/route.ts` using `feed` package
- `opengraph-image.tsx` using `next/og` ImageResponse
- **Verify**: Check `<head>` tags, `/sitemap.xml`, `/feed.xml`, OG image PNG

### Phase 6: Search
- Generate `public/search-index.json` at build time
- SearchProvider context with Cmd+K keyboard shortcut
- SearchDialog with Fuse.js fuzzy search over title/description/tags
- **Verify**: Cmd+K opens search, results navigate to posts

### Phase 7: Comments
- Set up Giscus GitHub App + Discussions on blog repo
- GiscusComments component (dynamic import, ssr: false)
- Theme sync with next-themes
- **Verify**: Comment widget renders, dark mode syncs

### Phase 8: Polish & Deploy
- PostNavigation (prev/next post links)
- Reading time display (computed in velite transform)
- Lazy loading for images
- Vercel deployment (vercel --prod)
- **Verify**: Production build runs, Vercel preview works

## Edge Cases

- **No posts**: Home page shows empty state message
- **Unpublished post**: Filtered by `getPosts()`, not in `generateStaticParams`
- **Invalid slug**: `notFound()` in post page → custom 404
- **Empty search**: Show recent posts or "no results" state
- **Giscus fails**: Component self-handles errors, page still functional
- **Dark mode flash**: next-themes `suppressHydrationWarning` + script injection prevents it

## Verification

After each phase, the verification step is listed. Full end-to-end check after all phases:
1. `pnpm build` succeeds with no errors
2. `pnpm start` serves the production build locally
3. Navigate: home → post → tags → tag filter → search
4. Toggle dark mode on all pages, verify no flicker
5. View source: check meta tags, JSON-LD
6. Visit `/feed.xml` and `/sitemap.xml` — valid XML
7. Visit `/posts/[slug]/opengraph-image` — returns 1200x630 PNG
8. Deploy to Vercel, verify preview URL works
