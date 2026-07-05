const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const siteConfig = {
  name: "Junyu Zha",
  author: "Junyu Zha",
  url: rawSiteUrl.replace(/\/$/, ""),
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
