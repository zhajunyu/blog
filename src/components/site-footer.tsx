import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>{siteConfig.name}</p>
    </footer>
  );
}
