import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import { getAllTags, getContentAvailability, getPostsByTag } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import {
  isLocale,
  locales,
  localizedPath,
  localeDetails,
} from "@/lib/i18n";

interface TagPageProps {
  params: Promise<{
    locale: string;
    tag: string;
  }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const params = await Promise.all(
    locales.map(async (locale) => {
      const tags = await getAllTags(locale);

      return tags.map((tag) => ({
        locale,
        tag: tag.slug,
      }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { locale: rawLocale, tag } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const tags = await getAllTags(rawLocale);
  const summary = tags.find((item) => item.slug === tag);

  if (!summary) {
    return {};
  }

  const availability = await getContentAvailability();
  const languages = Object.fromEntries(
    locales
      .filter((locale) => availability.tags[locale].includes(tag))
      .map((locale) => [
        localeDetails[locale].htmlLang,
        localizedPath(locale, `/tags/${tag}`),
      ]),
  );

  return {
    title: summary.name,
    description: `Posts tagged ${summary.name}.`,
    alternates: {
      canonical: localizedPath(rawLocale, `/tags/${summary.slug}`),
      languages,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { locale: rawLocale, tag } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const tags = await getAllTags(rawLocale);
  const summary = tags.find((item) => item.slug === tag);

  if (!summary) {
    notFound();
  }

  const posts = await getPostsByTag(rawLocale, tag);

  return (
    <section aria-labelledby="tag-title">
      <h1 id="tag-title" className="page-title">
        {summary.name}
      </h1>
      <p className="page-intro">{dictionary.tags.postCount(summary.count)}</p>

      <div className="post-list" style={{ marginTop: 48 }}>
        {posts.map((post, index) => (
          <PostCard
            key={post.slug}
            post={post}
            locale={rawLocale}
            priority={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
