import Link from "next/link";

import type { Post } from "@/lib/content";
import { formatDisplayDate } from "@/lib/content";
import { getCategoryLabel, getDictionary, getTagLabel } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface PostCardProps {
  post: Post;
  locale: Locale;
  priority?: boolean;
}

export function PostCard({ post, locale, priority = false }: PostCardProps) {
  const dictionary = getDictionary(locale);
  const categoryName = getCategoryLabel(locale, post.category);

  return (
    <article className={priority ? "post-card post-card-featured" : "post-card"}>
      <div className="post-card-meta">
        <time dateTime={post.date}>{formatDisplayDate(post.date, locale)}</time>
        <span>{post.readingTime}</span>
        <Link
          href={localizedPath(locale, `/categories/${post.category}`)}
          aria-label={`${dictionary.post.categoryLabel}: ${categoryName}`}
        >
          {categoryName}
        </Link>
      </div>
      <h2>
        <Link href={post.href}>{post.title}</Link>
      </h2>
      {post.description ? <p>{post.description}</p> : null}
      <div className="tag-row" aria-label={dictionary.post.tagsLabel}>
        {post.tags.map((tag) => (
          <Link key={tag} href={localizedPath(locale, `/tags/${tag}`)}>
            {getTagLabel(locale, tag)}
          </Link>
        ))}
      </div>
    </article>
  );
}
