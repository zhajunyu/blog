import Link from "next/link";

import { defaultLocale, localizedPath } from "@/lib/i18n";

export default function NotFound() {
  return (
    <section aria-labelledby="missing-title">
      <h1 id="missing-title" className="page-title">
        Page not found
      </h1>
      <p className="page-intro">
        The page may have moved, or the post may still be a draft.
      </p>
      <Link className="back-link" href={localizedPath(defaultLocale, "/posts")}>
        Back to posts
      </Link>
    </section>
  );
}
