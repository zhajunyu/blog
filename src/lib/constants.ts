export const SITE = {
  title: "My Blog",
  description: "Personal blog about tech, code, and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: "Junyu Zha",
  lang: "en",
} as const;

export const GISCUS = {
  repo: "zhajunyu/blog" as string,
  repoId: "R_kgDOSpEzIg" as string,
  category: "General" as string,
  categoryId: "DIC_kwDOSpEzIs4C97tV" as string,
};
