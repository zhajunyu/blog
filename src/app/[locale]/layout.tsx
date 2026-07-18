import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContentAvailability } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import {
  isLocale,
  localeDetails,
  locales,
  localizedAlternates,
  localizedPath,
} from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

import "../globals.css";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    return {};
  }

  const dictionary = getDictionary(rawLocale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: dictionary.site.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: dictionary.site.description,
    authors: [{ name: siteConfig.author }],
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
    openGraph: {
      type: "website",
      locale: localeDetails[rawLocale].ogLocale,
      url: localizedPath(rawLocale),
      siteName: siteConfig.name,
      title: dictionary.site.title,
      description: dictionary.site.description,
    },
    alternates: {
      canonical: localizedPath(rawLocale),
      languages: localizedAlternates(),
      types: {
        "application/rss+xml": localizedPath(rawLocale, "/rss.xml"),
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<LocaleLayoutProps>) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const availability = await getContentAvailability();

  return (
    <html lang={localeDetails[rawLocale].htmlLang}>
      <body>
        <div className="site-frame">
          <SiteHeader
            locale={rawLocale}
            dictionary={dictionary}
            availability={availability}
          />
          <main className="site-main">{children}</main>
          <SiteFooter locale={rawLocale} dictionary={dictionary} />
        </div>
      </body>
    </html>
  );
}
