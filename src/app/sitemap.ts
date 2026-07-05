import type { MetadataRoute } from "next";

import { getAllCategories, getAllPosts, getAllTags } from "@/lib/content";
import { locales, localizedAbsoluteUrl } from "@/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/posts", "/categories", "/tags", "/about", "/projects"];
  const localizedEntries = await Promise.all(
    locales.map(async (locale) => {
      const [posts, categories, tags] = await Promise.all([
        getAllPosts(locale, { includeDrafts: false }),
        getAllCategories(locale),
        getAllTags(locale),
      ]);

      return [
        ...staticRoutes.map((route) => ({
          url: localizedAbsoluteUrl(locale, route || "/"),
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: route === "" ? 1 : 0.7,
        })),
        ...posts.map((post) => ({
          url: localizedAbsoluteUrl(locale, `/posts/${post.slug}`),
          lastModified: new Date(`${post.updated ?? post.date}T00:00:00.000Z`),
          changeFrequency: "monthly" as const,
          priority: 0.8,
        })),
        ...categories.map((category) => ({
          url: localizedAbsoluteUrl(locale, `/categories/${category.slug}`),
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.5,
        })),
        ...tags.map((tag) => ({
          url: localizedAbsoluteUrl(locale, `/tags/${tag.slug}`),
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.5,
        })),
      ];
    }),
  );

  return localizedEntries.flat();
}
