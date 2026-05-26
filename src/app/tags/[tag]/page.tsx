import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostsByTag, getTags } from "@/lib/velite";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getTags().map((t) => ({ tag: t.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag}` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  if (posts.length === 0) notFound();

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">#{tag}</h1>
      <p className="text-muted-foreground mb-8">
        {posts.length} post{posts.length !== 1 ? "s" : ""}
      </p>

      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <article>
              <time
                dateTime={post.date}
                className="text-sm text-muted-foreground"
              >
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="text-2xl font-semibold mt-1">
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:underline decoration-2 underline-offset-4"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-muted-foreground mt-2">{post.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </main>
  );
}
