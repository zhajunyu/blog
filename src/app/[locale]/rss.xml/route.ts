import { getAllPosts } from "@/lib/content";
import { generateRssFeed } from "@/lib/rss";
import { isLocale, locales } from "@/lib/i18n";

interface RssRouteProps {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: RssRouteProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return new Response("Not found", { status: 404 });
  }

  const posts = await getAllPosts(rawLocale, { includeDrafts: false });

  return new Response(generateRssFeed(posts, rawLocale), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
