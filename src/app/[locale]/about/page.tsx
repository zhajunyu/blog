import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MdxContent } from "@/components/mdx-content";
import { getAboutContent } from "@/lib/content";
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

  const about = await getAboutContent(rawLocale);

  return {
    title: about.title,
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

  const about = await getAboutContent(rawLocale);

  return (
    <div className="split-page">
      <aside>
        <h1 className="page-title">{about.title}</h1>
      </aside>

      <div className="body-copy">
        <MdxContent source={about.body} />
      </div>
    </div>
  );
}
