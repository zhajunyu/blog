import { SITE } from "@/lib/constants";

interface JsonLdProps {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
}

export function JsonLd({ title, description, date, slug, tags }: JsonLdProps) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: date,
    url: `${SITE.url}/posts/${slug}`,
    mainEntityOfPage: `${SITE.url}/posts/${slug}`,
    author: { "@type": "Person", name: SITE.author },
    publisher: { "@type": "Organization", name: SITE.title },
    keywords: tags,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
