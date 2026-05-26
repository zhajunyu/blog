import type { Metadata } from "next";
import Link from "next/link";
import { getTags } from "@/lib/velite";

export const metadata: Metadata = {
  title: "Tags",
};

export default function TagsPage() {
  const tags = getTags();

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Tags</h1>

      {tags.length === 0 ? (
        <p className="text-muted-foreground">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(({ name, count }) => (
            <Link
              key={name}
              href={`/tags/${name}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent hover:bg-border transition-colors"
            >
              <span>{name}</span>
              <span className="text-xs text-muted-foreground">{count}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
