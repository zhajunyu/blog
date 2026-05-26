import Link from "next/link";

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tags/${tag}`}
      className="text-xs px-2 py-1 rounded-full bg-accent text-muted-foreground hover:text-foreground transition-colors"
    >
      {tag}
    </Link>
  );
}

export function TagBadges({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagBadge key={tag} tag={tag} />
      ))}
    </div>
  );
}
