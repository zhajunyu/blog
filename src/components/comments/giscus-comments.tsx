"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { GISCUS } from "@/lib/constants";

export function GiscusComments({ slug }: { slug: string }) {
  const { resolvedTheme } = useTheme();

  if (!GISCUS.repo || !GISCUS.repoId || !GISCUS.categoryId) {
    return null;
  }

  return (
    <Giscus
      repo={GISCUS.repo as `${string}/${string}`}
      repoId={GISCUS.repoId}
      category={GISCUS.category}
      categoryId={GISCUS.categoryId}
      mapping="specific"
      term={slug}
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      lang="en"
    />
  );
}
