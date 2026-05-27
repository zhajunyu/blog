import { Feed } from "feed";
import { getPosts } from "@/lib/velite";
import { SITE } from "@/lib/constants";

export const dynamic = "force-static";

export async function GET() {
  const feed = new Feed({
    title: SITE.title,
    description: SITE.description,
    id: SITE.url,
    link: SITE.url,
    language: SITE.lang,
    favicon: `${SITE.url}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    author: {
      name: SITE.author,
    },
  });

  for (const post of getPosts()) {
    feed.addItem({
      title: post.title,
      id: `${SITE.url}/posts/${post.slug}`,
      link: `${SITE.url}/posts/${post.slug}`,
      description: post.description,
      date: new Date(post.date),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
