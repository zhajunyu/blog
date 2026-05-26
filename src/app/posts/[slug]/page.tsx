import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPost, getPosts, getAdjacentPosts } from "@/lib/velite";
import { MdxBody } from "@/components/post/post-body";
import { TagBadges } from "@/components/post/tag-badge";
import { SITE } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      url: `${SITE.url}/posts/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: { canonical: `/posts/${post.slug}` },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <header className="mb-10">
        <time
          dateTime={post.date}
          className="text-sm text-muted-foreground"
        >
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {" · "}
          {post.readingTime} min read
        </time>
        <h1 className="text-4xl font-bold tracking-tight mt-2">
          {post.title}
        </h1>
        {post.tags.length > 0 && (
          <div className="mt-4">
            <TagBadges tags={post.tags} />
          </div>
        )}
      </header>

      <MdxBody code={post.body} />

      {(prev || next) && (
        <nav className="mt-16 pt-8 border-t border-border">
          <div className="flex justify-between gap-4">
            {prev ? (
              <Link
                href={`/posts/${prev.slug}`}
                className="group flex-1 min-w-0"
              >
                <span className="text-sm text-muted-foreground">
                  Previous
                </span>
                <span className="block font-medium truncate group-hover:underline">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/posts/${next.slug}`}
                className="group flex-1 min-w-0 text-right"
              >
                <span className="text-sm text-muted-foreground">Next</span>
                <span className="block font-medium truncate group-hover:underline">
                  {next.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </nav>
      )}
    </main>
  );
}
