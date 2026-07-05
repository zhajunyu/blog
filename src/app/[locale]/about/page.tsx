import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDictionary } from "@/lib/dictionaries";
import { isLocale, localizedAlternates, localizedPath } from "@/lib/i18n";

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);

  return {
    title: dictionary.about.metadataTitle,
    description: dictionary.about.metadataDescription,
    alternates: {
      canonical: localizedPath(rawLocale, "/about"),
      languages: localizedAlternates("/about"),
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);

  return (
    <div className="split-page">
      <aside>
        <h1 className="page-title">{dictionary.about.title}</h1>
      </aside>

      <div className="body-copy">
        {dictionary.about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {dictionary.about.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
