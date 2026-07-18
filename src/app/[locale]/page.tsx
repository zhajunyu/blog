import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, localizedAlternates, localizedPath } from "@/lib/i18n";

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);

  return {
    title: {
      absolute: dictionary.home.metadataTitle,
    },
    description: dictionary.site.description,
    alternates: {
      canonical: localizedPath(rawLocale),
      languages: localizedAlternates(),
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const posts = await getAllPosts(rawLocale);
  const latestPosts = posts.slice(0, 3);

  return (
    <div className="home-layout">
      <section className="hero-panel" aria-labelledby="home-title">
        <h1 id="home-title" className="page-title">
          {dictionary.home.title}
        </h1>
        <div className="hero-masthead-rule" aria-hidden="true">
          <span className="hero-masthead-accent" />
          <span className="hero-masthead-secondary" />
        </div>
        <p className="hero-deck">{dictionary.home.note}</p>
      </section>

      <section className="latest-writing" aria-labelledby="latest-writing">
        <div className="section-heading">
          <h2 id="latest-writing">{dictionary.home.latest}</h2>
          <Link href={localizedPath(rawLocale, "/posts")}>
            {dictionary.home.allPosts}
          </Link>
        </div>
        <div className="home-post-list">
          {latestPosts.map((post, index) => (
            <PostCard
              key={post.slug}
              post={post}
              locale={rawLocale}
              priority={index === 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
