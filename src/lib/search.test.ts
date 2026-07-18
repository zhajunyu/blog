import { describe, expect, it } from "vitest";

import {
  getHighlightedSearchSegments,
  normalizeSearchText,
  searchPosts,
  toSearchableText,
  type SearchIndexPost,
} from "@/lib/search";

const basePost: SearchIndexPost = {
  href: "/en/posts/reliable-search",
  title: "Reliable Search",
  description: "Notes on building predictable interfaces.",
  date: "2026-07-18",
  readingTime: "3 min read",
  category: "Tech",
  tags: ["Engineering", "Writing"],
  content:
    "A search interface should keep its index local, its ranking understandable, and its keyboard behavior predictable.",
};

describe("localized post search", () => {
  it("normalizes Unicode width, casing, and whitespace", () => {
    expect(normalizeSearchText("  ＳＥＡＲＣＨ\n  Archive ", "en")).toBe(
      "search archive",
    );
  });

  it("turns MDX into compact searchable text while retaining prose and code", () => {
    const text = toSearchableText(`
## Search structure

<Callout title="Design choice">
Read the [implementation notes](https://example.com).
</Callout>

\`\`\`ts
const locale = "en";
\`\`\`
`);

    expect(text).toBe(
      'Search structure Design choice Read the implementation notes. const locale = "en";',
    );
  });

  it("requires every query term and ranks title matches above body matches", () => {
    const titleMatch = basePost;
    const bodyMatch = {
      ...basePost,
      href: "/en/posts/another-post",
      title: "Another Post",
      content: "Reliable search belongs in the body of this post.",
    };
    const partialMatch = {
      ...basePost,
      href: "/en/posts/partial-post",
      title: "Reliable Notes",
      description: "This does not mention the second term.",
      content: "No matching phrase here.",
      category: "Essays",
      tags: [],
    };

    const results = searchPosts(
      [bodyMatch, partialMatch, titleMatch],
      "reliable search",
      "en",
    );

    expect(results.map((result) => result.post.href)).toEqual([
      "/en/posts/reliable-search",
      "/en/posts/another-post",
    ]);
  });

  it("matches localized taxonomy labels", () => {
    const [result] = searchPosts([basePost], "engineering", "en");

    expect(result.post.href).toBe(basePost.href);
    expect(result.score).toBeGreaterThan(0);
  });

  it("creates a contextual snippet around a body match", () => {
    const post = {
      ...basePost,
      content: `${"Earlier context. ".repeat(20)}distinctive phrase appears here. ${"Later context. ".repeat(20)}`,
    };
    const [result] = searchPosts([post], "distinctive phrase", "en");

    expect(result.snippet).toContain("distinctive phrase");
    expect(result.snippet.startsWith("…")).toBe(true);
    expect(result.snippet.endsWith("…")).toBe(true);
  });

  it("searches Chinese passages without space-delimited words", () => {
    const chinesePost: SearchIndexPost = {
      href: "/zh/posts/search",
      title: "构建搜索功能",
      description: "仅搜索当前语言的文章。",
      date: "2026-07-18",
      readingTime: "2 分钟阅读",
      category: "科技",
      tags: ["工程"],
      content: "搜索索引按语言分别生成，不会混入英文文章。",
    };

    expect(searchPosts([chinesePost], "按语言分别生成", "zh")).toHaveLength(1);
    expect(searchPosts([chinesePost], "英文文章", "zh")[0].post.title).toBe(
      "构建搜索功能",
    );
  });

  it("returns safe highlight segments instead of HTML", () => {
    expect(getHighlightedSearchSegments("Reliable <search>", "search", "en")).toEqual([
      { text: "Reliable <", highlighted: false },
      { text: "search", highlighted: true },
      { text: ">", highlighted: false },
    ]);
  });
});
