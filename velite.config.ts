import { defineCollection, defineConfig, s } from "velite";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.md",
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(300),
      date: s.isodate(),
      tags: s.array(s.string()).default([]),
      published: s.boolean().default(true),
      body: s.mdx(),
    })
    .transform((data, { meta }) => ({
      ...data,
      slug: meta.path.split("/").pop()!.replace(/\.md$/, ""),
      readingTime: Math.max(1, Math.ceil(data.body.replace(/<[^>]*>/g, "").split(/\s+/g).length / 200)),
    })),
});

export default defineConfig({
  collections: { posts },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: { light: "github-light", dark: "github-dark" },
          keepBackground: false,
        },
      ],
    ],
  },
});
