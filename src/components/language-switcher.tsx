"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getLanguageSwitchHref, type LocaleAvailability } from "@/lib/language-switch";
import { localeDetails, locales, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  activeLocale: Locale;
  ariaLabel: string;
  availability: LocaleAvailability;
}

export function LanguageSwitcher({
  activeLocale,
  ariaLabel,
  availability,
}: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav className="language-switcher" aria-label={ariaLabel}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={getLanguageSwitchHref(pathname, locale, availability)}
          aria-current={locale === activeLocale ? "true" : undefined}
        >
          {localeDetails[locale].label}
        </Link>
      ))}
    </nav>
  );
}
