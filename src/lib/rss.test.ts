import { describe, expect, it } from "vitest";

import { parsePostFile } from "@/lib/content";
import { escapeXml, generateRssFeed } from "@/lib/rss";

describe("rss generation", () => {
  it("escapes XML-sensitive characters", () => {
    expect(escapeXml(`R&D <notes> "today"`)).toBe(
      "R&amp;D &lt;notes&gt; &quot;today&quot;",
    );
  });

  it("generates a localized feed with post entries", () => {
    const post = parsePostFile(
      "en",
      "xml-notes",
      `---
title: "R&D <Notes>"
description: "Escaped feed content."
date: "2026-05-10"
category: "tech"
tags: ["writing"]
---

Body.
`,
    );

    const feed = generateRssFeed([post], "en");

    expect(feed).toContain("<rss version=\"2.0\"");
    expect(feed).toContain("<language>en</language>");
    expect(feed).toContain("R&amp;D &lt;Notes&gt;");
    expect(feed).toContain("<category>Tech</category>");
    expect(feed).toContain("<guid>https://example.com/en/posts/xml-notes</guid>");
  });

  it("generates zh channel metadata", () => {
    const feed = generateRssFeed([], "zh");

    expect(feed).toContain("<language>zh-CN</language>");
    expect(feed).toContain("关于构建、生活与想象的笔记");
  });
});
