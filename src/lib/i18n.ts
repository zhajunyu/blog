import { absoluteUrl } from "@/lib/site";

export const locales = ["en", "zh"] as const;
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

export const localeDetails: Record<
  Locale,
  {
    label: string;
    htmlLang: string;
    ogLocale: string;
    rssLanguage: string;
    dateLocale: string;
  }
> = {
  en: {
    label: "EN",
    htmlLang: "en",
    ogLocale: "en_US",
    rssLanguage: "en",
    dateLocale: "en",
  },
  zh: {
    label: "中文",
    htmlLang: "zh-CN",
    ogLocale: "zh_CN",
    rssLanguage: "zh-CN",
    dateLocale: "zh-CN",
  },
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localizedPath(locale: Locale, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function localizedAbsoluteUrl(locale: Locale, path = "/") {
  return absoluteUrl(localizedPath(locale, path));
}

export function localizedAlternates(path = "/") {
  return Object.fromEntries(
    locales.map((locale) => [localeDetails[locale].htmlLang, localizedPath(locale, path)]),
  );
}

export function formatDisplayDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(localeDetails[locale].dateLocale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function formatReadingTime(minutes: number, locale: Locale) {
  if (locale === "zh") {
    return `${minutes} 分钟阅读`;
  }

  return `${minutes} min read`;
}
