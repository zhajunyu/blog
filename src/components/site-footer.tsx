import Link from "next/link";

import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

interface SiteFooterProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function SiteFooter({ locale, dictionary }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <p>{siteConfig.name}</p>
      <div className="footer-links">
        <Link href={localizedPath(locale, "/rss.xml")}>{dictionary.footer.rss}</Link>
      </div>
    </footer>
  );
}
