import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDictionary } from "@/lib/dictionaries";
import { isLocale, localizedAlternates, localizedPath } from "@/lib/i18n";

interface ProjectsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);

  return {
    title: dictionary.projects.metadataTitle,
    description: dictionary.projects.metadataDescription,
    alternates: {
      canonical: localizedPath(rawLocale, "/projects"),
      languages: localizedAlternates("/projects"),
    },
  };
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);

  return (
    <section aria-labelledby="projects-title">
      <h1 id="projects-title" className="page-title">
        {dictionary.projects.title}
      </h1>
      <p className="page-intro">{dictionary.projects.intro}</p>

      <div className="project-list" style={{ marginTop: 48 }}>
        {dictionary.projects.items.map((project) => (
          <article key={project.name} className="project-item">
            <h2>{project.name}</h2>
            <p>{project.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
