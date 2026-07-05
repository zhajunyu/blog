import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAllTags } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, localizedAlternates, localizedPath } from "@/lib/i18n";

interface TagsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: TagsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);

  return {
    title: dictionary.tags.metadataTitle,
    description: dictionary.tags.metadataDescription,
    alternates: {
      canonical: localizedPath(rawLocale, "/tags"),
      languages: localizedAlternates("/tags"),
    },
  };
}

export default async function TagsPage({ params }: TagsPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const tags = await getAllTags(rawLocale);

  return (
    <section aria-labelledby="tags-title">
      <h1 id="tags-title" className="page-title">
        {dictionary.tags.title}
      </h1>
      <p className="page-intro">{dictionary.tags.intro}</p>

      <div className="tag-cloud" style={{ marginTop: 44 }}>
        {tags.map((tag) => (
          <Link
            key={tag.slug}
            className="tag-pill"
            href={localizedPath(rawLocale, `/tags/${tag.slug}`)}
          >
            {tag.name} ({tag.count})
          </Link>
        ))}
      </div>
    </section>
  );
}
