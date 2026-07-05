import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllCategories } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, localizedAlternates, localizedPath } from "@/lib/i18n";

interface CategoriesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoriesPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);

  return {
    title: dictionary.categories.metadataTitle,
    description: dictionary.categories.metadataDescription,
    alternates: {
      canonical: localizedPath(rawLocale, "/categories"),
      languages: localizedAlternates("/categories"),
    },
  };
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const categories = await getAllCategories(rawLocale);

  return (
    <section aria-labelledby="categories-title">
      <h1 id="categories-title" className="page-title">
        {dictionary.categories.title}
      </h1>
      <p className="page-intro">{dictionary.categories.intro}</p>

      <div className="tag-cloud" style={{ marginTop: 44 }}>
        {categories.map((category) => (
          <Link
            key={category.slug}
            className="tag-pill"
            href={localizedPath(rawLocale, `/categories/${category.slug}`)}
          >
            {category.name} ({category.count})
          </Link>
        ))}
      </div>
    </section>
  );
}
