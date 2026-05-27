"use client";

import dynamic from "next/dynamic";

const Comments = dynamic(
  () =>
    import("@/components/comments/giscus-comments").then(
      (mod) => mod.GiscusComments,
    ),
  { ssr: false },
);

export function GiscusLoader({ slug }: { slug: string }) {
  return <Comments slug={slug} />;
}
