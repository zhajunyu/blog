import { locales, type Locale } from "@/lib/i18n";

export interface LocaleAvailability {
  posts: Record<Locale, string[]>;
  categories: Record<Locale, string[]>;
  tags: Record<Locale, string[]>;
}

export function getLanguageSwitchHref(
  pathname: string,
  targetLocale: Locale,
  availability: LocaleAvailability,
) {
  const [, currentLocale, section, value] = pathname.split("/");

  if (!isKnownLocale(currentLocale)) {
    return `/${targetLocale}`;
  }

  if (!section) {
    return `/${targetLocale}`;
  }

  if (section === "posts" && value) {
    return availability.posts[targetLocale].includes(value)
      ? `/${targetLocale}/posts/${value}`
      : `/${targetLocale}/posts`;
  }

  if (section === "tags" && value) {
    return availability.tags[targetLocale].includes(value)
      ? `/${targetLocale}/tags/${value}`
      : `/${targetLocale}/tags`;
  }

  if (section === "categories" && value) {
    return availability.categories[targetLocale].includes(value)
      ? `/${targetLocale}/categories/${value}`
      : `/${targetLocale}/categories`;
  }

  const rest = pathname.split("/").slice(2).join("/");

  return rest ? `/${targetLocale}/${rest}` : `/${targetLocale}`;
}

function isKnownLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
