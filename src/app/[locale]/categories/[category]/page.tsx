import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import {
  getAllCategories,
  getContentAvailability,
  getPostsByCategory,
} from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import {
  isLocale,
  localeDetails,
  locales,
  localizedPath,
} from "@/lib/i18n";

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    category: string;
  }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const params = await Promise.all(
    locales.map(async (locale) => {
      const categories = await getAllCategories(locale);

      return categories.map((category) => ({
        locale,
        category: category.slug,
      }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale: rawLocale, category } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);
  const categories = await getAllCategories(rawLocale);
  const summary = categories.find((item) => item.slug === category);

  if (!summary) {
    return {};
  }

  const availability = await getContentAvailability();
  const languages = Object.fromEntries(
    locales
      .filter((locale) => availability.categories[locale].includes(category))
      .map((locale) => [
        localeDetails[locale].htmlLang,
        localizedPath(locale, `/categories/${category}`),
      ]),
  );

  return {
    title: summary.name,
    description: dictionary.categories.postCount(summary.count),
    alternates: {
      canonical: localizedPath(rawLocale, `/categories/${summary.slug}`),
      languages,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale: rawLocale, category } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const categories = await getAllCategories(rawLocale);
  const summary = categories.find((item) => item.slug === category);

  if (!summary) {
    notFound();
  }

  const posts = await getPostsByCategory(rawLocale, category);

  return (
    <section aria-labelledby="category-title">
      <h1 id="category-title" className="page-title">
        {summary.name}
      </h1>
      <p className="page-intro">
        {dictionary.categories.postCount(summary.count)}
      </p>

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
