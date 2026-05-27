import type { MetadataRoute } from "next";
import { getPosts, getTags } from "@/lib/velite";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts().map((p) => ({
    url: `${SITE.url}/posts/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const tags = getTags().map((t) => ({
    url: `${SITE.url}/tags/${t.name}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: SITE.url,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE.url}/tags`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...posts,
    ...tags,
  ];
}
