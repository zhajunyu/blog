import { describe, expect, it } from "vitest";

import {
  filterDrafts,
  getCategorySlug,
  getPostHeadings,
  getTagSlug,
  hasLayeredPostHeadings,
  parsePostFile,
  sortPosts,
} from "@/lib/content";
import {
  getCategoryDescription,
  getCategoryLabel,
  getTagLabel,
} from "@/lib/dictionaries";

const basePost = `---
title: "Reliable Interfaces"
description: "Notes on interfaces that age well."
date: "2026-02-03"
category: "tech"
tags: ["writing", "engineering"]
---

Readable systems start with boring contracts.
`;

describe("content parsing", () => {
  it("parses valid frontmatter into a localized post", () => {
    const post = parsePostFile("en", "reliable-interfaces", basePost);

    expect(post).toMatchObject({
      locale: "en",
      slug: "reliable-interfaces",
      href: "/en/posts/reliable-interfaces",
      title: "Reliable Interfaces",
      date: "2026-02-03",
      category: "tech",
      draft: false,
      tags: ["writing", "engineering"],
    });
    expect(post.readingTime).toBe("1 min read");
  });

  it("localizes reading time", () => {
    const post = parsePostFile("zh", "reliable-interfaces", basePost);

    expect(post.href).toBe("/zh/posts/reliable-interfaces");
    expect(post.readingTime).toBe("1 分钟阅读");
  });

  it("allows missing descriptions", () => {
    const post = parsePostFile(
      "en",
      "missing-description",
      `---
title: "Missing description"
date: "2026-02-03"
category: "tech"
tags: []
---

Body.
`,
    );

    expect(post.description).toBeUndefined();
  });

  it("treats blank descriptions as omitted", () => {
    const post = parsePostFile(
      "en",
      "blank-description",
      `---
title: "Blank description"
description: ""
date: "2026-02-03"
category: "tech"
tags: []
---

Body.
`,
    );

    expect(post.description).toBeUndefined();
  });

  it("rejects invalid required frontmatter", () => {
    expect(() =>
      parsePostFile(
        "en",
        "missing-title",
        `---
description: "Missing title"
date: "2026-02-03"
category: "tech"
tags: []
---

Body.
`,
      ),
    ).toThrow(/Invalid frontmatter/);
  });

  it("rejects missing categories", () => {
    expect(() =>
      parsePostFile(
        "en",
        "missing-category",
        `---
title: "Missing category"
date: "2026-02-03"
tags: []
---

Body.
`,
      ),
    ).toThrow(/Invalid frontmatter/);
  });

  it("rejects multiple categories", () => {
    expect(() =>
      parsePostFile(
        "en",
        "multiple-categories",
        `---
title: "Multiple categories"
date: "2026-02-03"
category: ["tech", "writing"]
tags: []
---

Body.
`,
      ),
    ).toThrow(/category/);
  });

  it("rejects non-stable category ids", () => {
    expect(() =>
      parsePostFile(
        "en",
        "bad-category",
        `---
title: "Bad category"
date: "2026-02-03"
category: "Tech Notes"
tags: []
---

Body.
`,
      ),
    ).toThrow(/Use a stable lowercase category id/);
  });

  it("rejects non-stable tag ids", () => {
    expect(() =>
      parsePostFile(
        "en",
        "bad-tags",
        `---
title: "Bad tags"
date: "2026-02-03"
category: "tech"
tags: ["Next.js"]
---

Body.
`,
      ),
    ).toThrow(/Use a stable lowercase tag id/);
  });

  it("filters drafts when drafts are disabled", () => {
    const published = parsePostFile("en", "published-post", basePost);
    const draft = parsePostFile(
      "en",
      "draft-post",
      `---
title: "Draft"
description: "A draft post."
date: "2026-03-01"
category: "tech"
tags: ["writing"]
draft: true
---

Draft body.
`,
    );

    expect(filterDrafts([published, draft], false)).toEqual([published]);
    expect(filterDrafts([published, draft], true)).toEqual([published, draft]);
  });

  it("sorts posts newest first and then by title", () => {
    const first = parsePostFile(
      "en",
      "first",
      basePost.replace("Reliable Interfaces", "Alpha").replace("2026-02-03", "2026-01-01"),
    );
    const second = parsePostFile(
      "en",
      "second",
      basePost.replace("Reliable Interfaces", "Beta").replace("2026-02-03", "2026-04-01"),
    );
    const third = parsePostFile(
      "en",
      "third",
      basePost.replace("Reliable Interfaces", "Aardvark").replace("2026-02-03", "2026-04-01"),
    );

    expect(sortPosts([first, second, third]).map((post) => post.title)).toEqual([
      "Aardvark",
      "Beta",
      "Alpha",
    ]);
  });

  it("creates stable tag slugs and localized labels", () => {
    expect(getTagSlug("Design Systems")).toBe("design-systems");
    expect(getTagSlug("  Next.js / MDX  ")).toBe("next-js-mdx");
    expect(getTagLabel("en", "writing")).toBe("Writing");
    expect(getTagLabel("zh", "writing")).toBe("写作");
  });

  it("creates stable category slugs and localized labels", () => {
    expect(getCategorySlug("Tech Notes")).toBe("tech-notes");
    expect(getCategoryLabel("en", "tech")).toBe("Tech");
    expect(getCategoryLabel("zh", "tech")).toBe("科技");
    expect(getCategoryDescription("en", "tech")).toContain("Engineering notes");
    expect(getCategoryDescription("zh", "tech")).toContain("工程笔记");
  });

  it("extracts article headings outside fenced code blocks", () => {
    const headings = getPostHeadings(`
## First section

\`\`\`md
### Ignored example
\`\`\`

### Nested \`code\` heading
#### [Linked detail](https://example.com)
### Nested code heading
`);

    expect(headings).toEqual([
      { id: "first-section", level: 2, title: "First section" },
      { id: "nested-code-heading", level: 3, title: "Nested code heading" },
      { id: "linked-detail", level: 4, title: "Linked detail" },
      { id: "nested-code-heading-1", level: 3, title: "Nested code heading" },
    ]);
  });

  it("detects layered article heading structure", () => {
    expect(
      hasLayeredPostHeadings([
        { id: "one", level: 2, title: "One" },
        { id: "two", level: 2, title: "Two" },
      ]),
    ).toBe(false);

    expect(
      hasLayeredPostHeadings([
        { id: "one", level: 2, title: "One" },
        { id: "one-a", level: 3, title: "One A" },
      ]),
    ).toBe(true);
  });
});
