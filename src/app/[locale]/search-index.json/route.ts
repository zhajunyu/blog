import { isLocale, locales } from "@/lib/i18n";
import { buildSearchIndex } from "@/lib/search-index";

interface SearchIndexRouteContext {
  params: Promise<{
    locale: string;
  }>;
}

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, context: SearchIndexRouteContext) {
  const { locale: rawLocale } = await context.params;

  if (!isLocale(rawLocale)) {
    return Response.json({ error: "Locale not found" }, { status: 404 });
  }

  return Response.json(await buildSearchIndex(rawLocale));
}
