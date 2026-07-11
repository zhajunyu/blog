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

      <ul className="indexed-card-grid">
        {categories.map((category, index) => (
          <li key={category.slug} className="indexed-card-grid-item">
            <Link
              className="indexed-card"
              href={localizedPath(rawLocale, `/categories/${category.slug}`)}
            >
              <span className="indexed-card-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="indexed-card-content">
                <span className="indexed-card-heading">
                  <span className="indexed-card-title">{category.name}</span>
                  <span className="indexed-card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </span>
                <span className="indexed-card-description">
                  {category.description}
                </span>
                <span className="indexed-card-meta">
                  {dictionary.categories.postCount(category.count)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
