import Link from "next/link";
import { getPosts } from "@/lib/velite";

export default function HomePage() {
  const posts = getPosts();

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight mb-8">My Blog</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
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
                {post.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tags/${tag}`}
                        className="text-xs px-2 py-1 rounded-full bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
