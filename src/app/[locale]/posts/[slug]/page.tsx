import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import rehypeShiki from "@shikijs/rehype";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/components/mdx-components";
import {
  formatDisplayDate,
  getAllPosts,
  getContentAvailability,
  getPostHeadings,
  getPostBySlug,
  hasLayeredPostHeadings,
} from "@/lib/content";
import { getCategoryLabel, getDictionary, getTagLabel } from "@/lib/dictionaries";
import {
  isLocale,
  locales,
  localizedAbsoluteUrl,
  localizedPath,
  localeDetails,
} from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

interface PostPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const params = await Promise.all(
    locales.map(async (locale) => {
      const posts = await getAllPosts(locale);

      return posts.map((post) => ({
        locale,
        slug: post.slug,
      }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const post = await getPostBySlug(rawLocale, slug).catch(() => null);

  if (!post) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);
  const categoryName = getCategoryLabel(rawLocale, post.category);
  const availability = await getContentAvailability();
  const languages = Object.fromEntries(
    locales
      .filter((locale) => availability.posts[locale].includes(slug))
      .map((locale) => [
        localeDetails[locale].htmlLang,
        localizedPath(locale, `/posts/${slug}`),
      ]),
  );

  return {
    title: post.title,
    description: post.description ?? dictionary.site.description,
    alternates: {
      canonical: post.href,
      languages,
    },
    openGraph: {
      type: "article",
      url: localizedAbsoluteUrl(rawLocale, `/posts/${slug}`),
      title: post.title,
      description: post.description ?? dictionary.site.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [siteConfig.author],
      section: categoryName,
      tags: post.tags.map((tag) => getTagLabel(rawLocale, tag)),
      locale: localeDetails[rawLocale].ogLocale,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale: rawLocale, slug } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const post = await getPostBySlug(rawLocale, slug).catch(() => null);

  if (!post || (post.draft && process.env.NODE_ENV === "production")) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const categoryName = getCategoryLabel(rawLocale, post.category);
  const headings = getPostHeadings(post.body);
  const hasStructure = hasLayeredPostHeadings(headings);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    articleSection: categoryName,
    author: {
      "@type": "Person",
      name: siteConfig.author,
    },
    mainEntityOfPage: localizedAbsoluteUrl(rawLocale, `/posts/${slug}`),
    url: localizedAbsoluteUrl(rawLocale, `/posts/${slug}`),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article
        className={
          hasStructure
            ? "article-shell article-shell-with-structure"
            : "article-shell article-shell-centered"
        }
      >
        <div className="article-main">
          <header className="article-header">
            <div className="article-meta">
              <time dateTime={post.date}>{formatDisplayDate(post.date, rawLocale)}</time>
              <span>{post.readingTime}</span>
              <Link
                href={localizedPath(rawLocale, `/categories/${post.category}`)}
                aria-label={`${dictionary.post.categoryLabel}: ${categoryName}`}
              >
                {categoryName}
              </Link>
            </div>
            <h1>{post.title}</h1>
            {post.description ? (
              <p className="article-deck">{post.description}</p>
            ) : null}
            <div className="tag-row" aria-label={dictionary.post.tagsLabel}>
              {post.tags.map((tag) => (
                <Link key={tag} href={localizedPath(rawLocale, `/tags/${tag}`)}>
                  {getTagLabel(rawLocale, tag)}
                </Link>
              ))}
            </div>
          </header>

          <div className="article-body">
            <MDXRemote
              source={post.body}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,
                    [
                      rehypeShiki,
                      {
                        themes: {
                          light: "github-dark",
                          dark: "github-dark-high-contrast",
                        },
                        defaultColor: false,
                      },
                    ],
                  ],
                },
              }}
            />
          </div>

          <footer className="article-footer">
            <Link className="back-link" href={localizedPath(rawLocale, "/posts")}>
              {dictionary.post.backToPosts}
            </Link>
          </footer>
        </div>

        {hasStructure ? (
          <aside className="article-structure" aria-label={dictionary.post.structureLabel}>
            <p>{dictionary.post.structureTitle}</p>
            <nav>
              <ol>
                {headings.map((heading) => (
                  <li
                    key={heading.id}
                    className={`article-structure-level-${heading.level}`}
                  >
                    <a href={`#${heading.id}`}>{heading.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        ) : null}
      </article>
    </>
  );
}
