import { describe, expect, it } from "vitest";

import { getLanguageSwitchHref, type LocaleAvailability } from "@/lib/language-switch";

const availability: LocaleAvailability = {
  posts: {
    en: ["building-this-blog", "en-only"],
    zh: ["building-this-blog"],
  },
  categories: {
    en: ["tech", "en-only"],
    zh: ["tech"],
  },
  tags: {
    en: ["next-js", "writing"],
    zh: ["next-js"],
  },
};

describe("language switch links", () => {
  it("preserves equivalent post paths", () => {
    expect(
      getLanguageSwitchHref("/en/posts/building-this-blog", "zh", availability),
    ).toBe("/zh/posts/building-this-blog");
  });

  it("falls back to the posts index when the translated post is missing", () => {
    expect(getLanguageSwitchHref("/en/posts/en-only", "zh", availability)).toBe(
      "/zh/posts",
    );
  });

  it("preserves regular localized pages", () => {
    expect(getLanguageSwitchHref("/en/about", "zh", availability)).toBe("/zh/about");
  });

  it("falls back to the tags index when the translated tag is missing", () => {
    expect(getLanguageSwitchHref("/en/tags/writing", "zh", availability)).toBe(
      "/zh/tags",
    );
  });

  it("preserves equivalent category paths", () => {
    expect(getLanguageSwitchHref("/en/categories/tech", "zh", availability)).toBe(
      "/zh/categories/tech",
    );
  });

  it("falls back to the categories index when the translated category is missing", () => {
    expect(getLanguageSwitchHref("/en/categories/en-only", "zh", availability)).toBe(
      "/zh/categories",
    );
  });
});
