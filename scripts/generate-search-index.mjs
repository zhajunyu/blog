import { readFileSync, writeFileSync } from "fs";

const posts = JSON.parse(readFileSync(".velite/posts.json", "utf8"));

const index = posts
  .filter((p) => p.published)
  .map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    tags: p.tags,
    date: p.date,
  }));

writeFileSync("public/search-index.json", JSON.stringify(index));
console.log(`Search index generated with ${index.length} posts`);
