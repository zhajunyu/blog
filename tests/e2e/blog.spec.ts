import { expect, test } from "@playwright/test";

function rgbFromHex(hex: string) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgb(${red}, ${green}, ${blue})`;
}

test("renders localized core routes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page).toHaveTitle("Junyu's Blog");
  await expect(page.getByRole("heading", { name: /notes on making/i })).toBeVisible();
  await expect(page.locator(".hero-deck")).toContainText(
    "Technical writing, essays, and fiction",
  );
  await expect(
    page.getByLabel("Primary navigation").getByRole("link", { name: "Posts" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Primary navigation").getByRole("link", { name: "Categories" }),
  ).toBeVisible();

  await page.goto("/en/posts");
  await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible();
  await expect(page.getByRole("link", { name: /building this blog/i })).toBeVisible();
  await expect(page.locator(".post-list > .post-card").last()).toHaveCSS(
    "border-bottom-width",
    "0px",
  );

  await page.goto("/en/posts/building-this-blog");
  await expect(page.getByRole("heading", { name: /building this blog/i })).toBeVisible();
  await expect(page.locator("article")).toContainText("static-first");

  await page.goto("/zh");
  await expect(page).toHaveTitle("Junyu 的博客");
  await expect(page.getByRole("heading", { name: /关于构建/ })).toBeVisible();

  await page.goto("/zh/posts");
  await expect(page.getByRole("heading", { name: "文章" })).toBeVisible();
  await expect(page.getByRole("link", { name: /构建这个博客/ })).toBeVisible();

  await page.goto("/zh/posts/building-this-blog");
  await expect(page.getByRole("heading", { name: /构建这个博客/ })).toBeVisible();
  await expect(page.locator("article")).toContainText("静态优先");

  await page.goto("/en/projects");
  await expect(page.getByRole("link", { name: /personal blog/i })).toHaveAttribute(
    "href",
    "https://github.com/zhajunyu/blog",
  );
});

test("renders MDX list markers and underlined links", async ({ page }) => {
  await page.goto("/en/posts/surge-proxy-configuration");

  await expect(page.locator(".article-body ol").first()).toHaveCSS(
    "list-style-type",
    "decimal",
  );
  await expect(page.locator(".article-body ul").first()).toHaveCSS(
    "list-style-type",
    "disc",
  );
  await expect(page.locator(".article-body a").first()).toHaveCSS(
    "text-decoration-line",
    "underline",
  );
});

test("highlights fenced code by language and preserves plain text", async ({ page }) => {
  await page.goto("/en/posts/building-this-blog");

  const typescriptBlock = page
    .locator(".article-body pre.shiki")
    .filter({ hasText: "type PostFrontmatter" });

  await expect(typescriptBlock).toContainText("description?: string;");
  expect(
    await typescriptBlock.locator("code .line > span[style*='--shiki-light']").count(),
  ).toBeGreaterThan(1);

  await page.goto("/en/posts/surge-proxy-configuration");

  const iniBlock = page
    .locator(".article-body pre.shiki")
    .filter({ hasText: "[General]" })
    .first();
  const textBlock = page
    .locator(".article-body pre.shiki")
    .filter({ hasText: "Remote subscription" });

  expect(
    await iniBlock.locator("code .line > span[style*='--shiki-light']").count(),
  ).toBeGreaterThan(1);
  await expect(textBlock).toContainText("Request -> Custom rules");
  await expect(page.locator(".article-body p code").first()).not.toHaveClass(/shiki/);

  const plainTextColors = await textBlock.locator("code .line > span").evaluateAll(
    (tokens) => [...new Set(tokens.map((token) => getComputedStyle(token).color))],
  );

  expect(plainTextColors).toHaveLength(1);
});

test("switches language through the header control", async ({ page }) => {
  await page.goto("/en/posts/building-this-blog");
  await page.getByLabel("Language").getByRole("link", { name: "中文" }).click();
  await expect(page).toHaveURL(/\/zh\/posts\/building-this-blog$/);
  await expect(page.getByRole("heading", { name: /构建这个博客/ })).toBeVisible();

  await page.getByLabel("语言").getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/\/en\/posts\/building-this-blog$/);
});

test("keeps homepage sections separate while scrolling", async ({ page }) => {
  await page.goto("/en");
  await page.locator(".latest-writing").scrollIntoViewIfNeeded();

  const layout = await page.evaluate(() => {
    const bars = document.querySelector<HTMLElement>(".hero-masthead-rule");
    const deck = document.querySelector<HTMLElement>(".hero-deck");
    const hero = document.querySelector<HTMLElement>(".hero-panel");
    const lastCard = document.querySelector<HTMLElement>(
      ".home-post-list .post-card:last-child",
    );
    const latestWriting = document.querySelector<HTMLElement>(".latest-writing");
    const title = document.querySelector<HTMLElement>("#home-title");

    if (!bars || !deck || !hero || !lastCard || !latestWriting || !title) {
      throw new Error("Expected homepage sections were not rendered.");
    }

    const heroStyle = getComputedStyle(hero);
    const titleStyle = getComputedStyle(title);

    return {
      borderBottomWidth: heroStyle.borderBottomWidth,
      deckWidth: deck.getBoundingClientRect().width,
      heroBottom: hero.getBoundingClientRect().bottom,
      heroPosition: heroStyle.position,
      lastCardBorderBottomWidth: getComputedStyle(lastCard).borderBottomWidth,
      latestWritingTop: latestWriting.getBoundingClientRect().top,
      sectionGap:
        latestWriting.getBoundingClientRect().top - hero.getBoundingClientRect().bottom,
      titleToBarsGap:
        bars.getBoundingClientRect().top - title.getBoundingClientRect().bottom,
      titleLineHeightRatio:
        Number.parseFloat(titleStyle.lineHeight) /
        Number.parseFloat(titleStyle.fontSize),
    };
  });

  expect(layout.borderBottomWidth).toBe("0px");
  expect(layout.deckWidth).toBeGreaterThan(280);
  expect(layout.heroPosition).toBe("static");
  expect(layout.lastCardBorderBottomWidth).toBe("0px");
  expect(layout.heroBottom).toBeLessThanOrEqual(layout.latestWritingTop);
  expect(layout.sectionGap).toBeGreaterThanOrEqual(47);
  expect(layout.titleToBarsGap).toBeGreaterThanOrEqual(35);
  expect(layout.titleLineHeightRatio).toBeGreaterThanOrEqual(1.07);
});

test("renders localized categories, tags, rss, sitemap, and legacy redirects", async ({ page }) => {
  await page.goto("/en/categories");
  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();
  const techCategory = page.getByRole("link", { name: /tech/i });
  await expect(techCategory).toBeVisible();
  await expect(techCategory).toContainText("Engineering notes");
  await expect(techCategory).toHaveCSS("border-top-style", "solid");
  await expect(page.getByRole("link", { name: /essays/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /fictions/i })).toBeVisible();
  await expect(page.locator(".indexed-card-title")).toHaveText([
    "Tech",
    "Essays",
    "Fictions",
  ]);

  await page.goto("/zh/categories");
  await expect(page.locator(".indexed-card-title")).toHaveText([
    "科技",
    "随笔",
    "小说",
  ]);

  await page.goto("/en/categories/tech");
  await expect(page.getByRole("heading", { name: "Tech" })).toBeVisible();
  await expect(page.getByRole("link", { name: /building this blog/i })).toBeVisible();

  await page.goto("/zh/categories/tech");
  await expect(page.getByRole("heading", { name: "科技" })).toBeVisible();
  await expect(page.getByRole("link", { name: /构建这个博客/ })).toBeVisible();

  await page.goto("/en/tags/next-js");
  await expect(page.getByRole("heading", { name: "Next.js" })).toBeVisible();

  await page.goto("/zh/tags/writing");
  await expect(page.getByRole("heading", { name: "写作" })).toBeVisible();

  const rssResponse = await page.goto("/zh/rss.xml");
  expect(rssResponse?.headers()["content-type"]).toContain("application/rss+xml");
  await expect(page.locator("body")).toContainText("构建这个博客");

  const sitemapResponse = await page.goto("/sitemap.xml");
  expect(sitemapResponse?.headers()["content-type"]).toContain("application/xml");
  await expect(page.locator("body")).toContainText("/en/posts/building-this-blog");
  await expect(page.locator("body")).toContainText("/en/categories/tech");
  await expect(page.locator("body")).toContainText("/zh/posts/building-this-blog");
  await expect(page.locator("body")).toContainText("/zh/categories/tech");

  await page.goto("/blog/building-this-blog");
  await expect(page).toHaveURL(/\/en\/posts\/building-this-blog$/);
});

test.describe("system color scheme", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`renders readable article content in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/en/posts/building-this-blog");

      await expect(page.getByRole("heading", { name: /building this blog/i })).toBeVisible();
      await expect(page.locator(".mdx-callout")).toContainText("Design choice");
      await expect(page.locator(".article-body pre")).toContainText("PostFrontmatter");

      const expectedPalette =
        colorScheme === "dark"
          ? { bodyEnd: "#1a1c13", bodyStart: "#0f100c", ink: "#f2efe4", paper: "#12130e" }
          : { bodyEnd: "#ecefe7", bodyStart: "#fbfbf8", ink: "#151612", paper: "#f7f7f3" };

      const palette = await page.evaluate((activeColorScheme) => {
        const root = getComputedStyle(document.documentElement);
        const body = getComputedStyle(document.body);
        const articleParagraph = document.querySelector<HTMLElement>(".article-body p");
        const codeBlock = document.querySelector<HTMLElement>(".article-body pre");
        const callout = document.querySelector<HTMLElement>(".mdx-callout");
        const highlightedToken = document.querySelector<HTMLElement>(
          ".article-body pre.shiki span[style*='--shiki-light']",
        );

        if (!articleParagraph || !codeBlock || !callout || !highlightedToken) {
          throw new Error("Expected themed article content was not rendered.");
        }

        const activeTokenProperty =
          activeColorScheme === "dark" ? "--shiki-dark" : "--shiki-light";
        const expectedToken = document.createElement("span");
        expectedToken.style.color = highlightedToken.style.getPropertyValue(activeTokenProperty);
        document.body.append(expectedToken);
        const expectedTokenColor = getComputedStyle(expectedToken).color;
        expectedToken.remove();

        return {
          articleText: getComputedStyle(articleParagraph).color,
          bodyBackgroundImage: body.backgroundImage,
          bodyEnd: root.getPropertyValue("--color-body-end").trim(),
          bodyStart: root.getPropertyValue("--color-body-start").trim(),
          calloutBackground: getComputedStyle(callout).backgroundColor,
          codeBackground: getComputedStyle(codeBlock).backgroundColor,
          codeOverflow: getComputedStyle(codeBlock).overflowX,
          ink: root.getPropertyValue("--color-ink").trim(),
          paper: root.getPropertyValue("--color-paper").trim(),
          tokenColor: getComputedStyle(highlightedToken).color,
          expectedTokenColor,
        };
      }, colorScheme);

      expect(palette).toMatchObject(expectedPalette);
      expect(palette.bodyBackgroundImage).toContain(rgbFromHex(expectedPalette.bodyStart));
      expect(palette.bodyBackgroundImage).toContain(rgbFromHex(expectedPalette.paper));
      expect(palette.bodyBackgroundImage).toContain(rgbFromHex(expectedPalette.bodyEnd));
      expect(palette.articleText).not.toBe("rgba(0, 0, 0, 0)");
      expect(palette.calloutBackground).not.toBe("rgba(0, 0, 0, 0)");
      expect(palette.codeBackground).not.toBe("rgba(0, 0, 0, 0)");
      expect(palette.codeOverflow).toBe("auto");
      expect(palette.tokenColor).toBe(palette.expectedTokenColor);
    });
  }
});
