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

      <ol className="indexed-card-grid">
        {dictionary.projects.items.map((project, index) => (
          <li key={project.name} className="indexed-card-grid-item">
            <a className="indexed-card" href={project.href}>
              <span className="indexed-card-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="indexed-card-content">
                <span className="indexed-card-heading">
                  <span className="indexed-card-title" role="heading" aria-level={2}>
                    {project.name}
                  </span>
                  <span className="indexed-card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </span>
                <span className="indexed-card-description">
                  {project.description}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
