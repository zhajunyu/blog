import type { Post } from "@/lib/content";
import { getCategoryLabel, getDictionary } from "@/lib/dictionaries";
import {
  localizedAbsoluteUrl,
  localizedPath,
  localeDetails,
  type Locale,
} from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export function generateRssFeed(posts: Post[], locale: Locale) {
  const dictionary = getDictionary(locale);
  const items = posts.map((post) => generateRssItem(post, locale)).join("\n");
  const channelUrl = localizedAbsoluteUrl(locale);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(dictionary.site.title)}</title>
    <link>${escapeXml(channelUrl)}</link>
    <description>${escapeXml(dictionary.site.description)}</description>
    <language>${localeDetails[locale].rssLanguage}</language>
    <atom:link href="${escapeXml(localizedAbsoluteUrl(locale, "/rss.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateRssItem(post: Post, locale: Locale) {
  const url = `${siteConfig.url}${post.href}`;
  const pubDate = new Date(`${post.date}T00:00:00.000Z`).toUTCString();

  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <description>${escapeXml(post.description ?? post.title)}</description>
      <category>${escapeXml(getCategoryLabel(locale, post.category))}</category>
      <pubDate>${pubDate}</pubDate>
    </item>`;
}

export function getRssPath(locale: Locale) {
  return localizedPath(locale, "/rss.xml");
}
