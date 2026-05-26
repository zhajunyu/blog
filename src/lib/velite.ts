import { posts as allPosts, type Post } from "../../.velite";

export type { Post };

export function getPosts() {
  return allPosts
    .filter((p) => p.published)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getPost(slug: string) {
  return getPosts().find((p) => p.slug === slug) ?? null;
}

export function getTags() {
  const map = new Map<string, number>();
  for (const post of getPosts()) {
    for (const tag of post.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByTag(tag: string) {
  return getPosts().filter((p) => p.tags.includes(tag));
}

export function getAdjacentPosts(slug: string) {
  const all = getPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
