"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";

import { getLanguageSwitchHref, type LocaleAvailability } from "@/lib/language-switch";
import type { Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  activeLocale: Locale;
  ariaLabel: string;
  availability: LocaleAvailability;
  switchLabel: string;
}

export function LanguageSwitcher({
  activeLocale,
  ariaLabel,
  availability,
  switchLabel,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const targetLocale: Locale = activeLocale === "en" ? "zh" : "en";

  return (
    <nav className="language-switcher" aria-label={ariaLabel}>
      <Link
        href={getLanguageSwitchHref(pathname, targetLocale, availability)}
        aria-label={switchLabel}
      >
        <Languages aria-hidden="true" size={23} strokeWidth={1.8} />
      </Link>
    </nav>
  );
}
