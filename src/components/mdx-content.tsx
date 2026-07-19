import rehypeShiki from "@shikijs/rehype";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/components/mdx-components";

interface MdxContentProps {
  source: string;
}

export function MdxContent({ source }: MdxContentProps) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeShiki,
              {
                addLanguageClass: true,
                themes: {
                  light: "github-dark",
                  dark: "github-dark-high-contrast",
                },
                defaultColor: false,
              },
            ],
          ],
        },
      }}
    />
  );
}
