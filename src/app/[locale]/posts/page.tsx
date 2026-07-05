import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, localizedAlternates, localizedPath } from "@/lib/i18n";

interface PostsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PostsPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);

  return {
    title: dictionary.posts.metadataTitle,
    description: dictionary.posts.metadataDescription,
    alternates: {
      canonical: localizedPath(rawLocale, "/posts"),
      languages: localizedAlternates("/posts"),
    },
  };
}

export default async function PostsPage({ params }: PostsPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const posts = await getAllPosts(rawLocale);

  return (
    <section aria-labelledby="posts-title">
      <h1 id="posts-title" className="page-title">
        {dictionary.posts.title}
      </h1>
      <p className="page-intro">{dictionary.posts.intro}</p>

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
