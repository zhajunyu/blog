import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNavigation } from "@/components/mobile-navigation";
import type { Dictionary } from "@/lib/dictionaries";
import type { LocaleAvailability } from "@/lib/language-switch";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface SiteHeaderProps {
  locale: Locale;
  dictionary: Dictionary;
  availability: LocaleAvailability;
}

export function SiteHeader({ locale, dictionary, availability }: SiteHeaderProps) {
  const navItems = [
    { href: localizedPath(locale, "/posts"), label: dictionary.nav.posts },
    { href: localizedPath(locale, "/categories"), label: dictionary.nav.category },
    { href: localizedPath(locale, "/tags"), label: dictionary.nav.tags },
    { href: localizedPath(locale, "/projects"), label: dictionary.nav.projects },
    { href: localizedPath(locale, "/about"), label: dictionary.nav.about },
  ] as const;

  return (
    <header className="site-header">
      <Link className="site-mark" href={localizedPath(locale)} aria-label={dictionary.nav.homeAria}>
        {dictionary.nav.brand}
      </Link>
      <div className="site-header-actions">
        <nav className="site-nav" aria-label={dictionary.nav.primary}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <LanguageSwitcher
          activeLocale={locale}
          ariaLabel={dictionary.nav.language}
          availability={availability}
          switchLabel={dictionary.nav.switchLanguage}
        />
        <MobileNavigation
          ariaLabel={dictionary.nav.primary}
          closeLabel={dictionary.nav.closeMenu}
          items={navItems}
          openLabel={dictionary.nav.openMenu}
        />
      </div>
    </header>
  );
}
