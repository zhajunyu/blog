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
  const englishLogo = page.getByRole("link", { name: "Home" });
  await expect(englishLogo).toHaveText("Junyu's Blog");
  await expect(englishLogo).toHaveAttribute("href", "/en");
  await expect(page.getByRole("heading", { name: /notes on making/i })).toBeVisible();
  await expect(page.locator(".hero-deck")).toContainText(
    "Technical writing, essays, and fiction",
  );

  const mobileMenuButton = page.getByRole("button", { name: "Open navigation" });
  let primaryNavigation = page.getByLabel("Primary navigation").first();

  if (await mobileMenuButton.isVisible()) {
    await mobileMenuButton.click();
    primaryNavigation = page.getByLabel("Primary navigation").last();
  }

  await expect(
    primaryNavigation.getByRole("link", { name: "Posts" }),
  ).toBeVisible();
  await expect(
    primaryNavigation.getByRole("link", { name: "Categories" }),
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
  await page.getByRole("link", { name: "Home" }).click();
  await expect(page).toHaveURL(/\/en$/);

  await page.goto("/zh");
  await expect(page).toHaveTitle("Junyu 的博客");
  const chineseLogo = page.getByRole("link", { name: "首页" });
  await expect(chineseLogo).toHaveText("Junyu 的博客");
  await expect(chineseLogo).toHaveAttribute("href", "/zh");
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
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en/posts/building-this-blog");
  const englishLanguageToggle = page
    .getByLabel("Language")
    .getByRole("link", { name: "Switch to Chinese" });

  await expect(englishLanguageToggle.locator("svg")).toHaveClass(/lucide-languages/);
  await expect(englishLanguageToggle.locator("svg")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 8, 0)",
  );
  await expect(englishLanguageToggle).toHaveCSS("border-top-width", "0px");
  await englishLanguageToggle.click();
  await expect(page).toHaveURL(/\/zh\/posts\/building-this-blog$/);
  await expect(page.getByRole("heading", { name: /构建这个博客/ })).toBeVisible();

  const chineseLanguageToggle = page
    .getByLabel("语言")
    .getByRole("link", { name: "切换到英文" });

  await expect(chineseLanguageToggle.locator("svg")).toHaveClass(/lucide-languages/);
  await chineseLanguageToggle.click();
  await expect(page).toHaveURL(/\/en\/posts\/building-this-blog$/);
});

test("uses an accessible menu on narrow screens", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");

  const logo = page.getByRole("link", { name: "Home" });
  const languageSwitcher = page.getByLabel("Language");
  const languageToggle = languageSwitcher.getByRole("link", { name: "Switch to Chinese" });
  const headerActions = page.locator(".site-header-actions");
  const menuButton = page.locator(".mobile-menu-toggle");
  const menuIcon = menuButton.locator(".lucide-menu");
  const closeIcon = menuButton.locator(".lucide-x");

  await expect(logo).toBeVisible();
  await expect(logo).toHaveCSS("font-size", "22px");
  await expect(logo).toHaveCSS("padding-left", "6px");
  await expect(logo).toHaveCSS("border-top-width", "0px");
  await expect(logo).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(languageSwitcher).toBeVisible();
  await expect(languageToggle.locator("svg")).toHaveClass(/lucide-languages/);
  await expect(languageToggle.locator("svg")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 10, 0)",
  );
  await expect(languageToggle).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(headerActions).toHaveCSS("column-gap", "4px");
  await expect(menuButton).toHaveAccessibleName("Open navigation");
  await expect(menuButton).toHaveCSS("border-top-width", "0px");
  await expect(menuButton).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(menuButton).toHaveCSS("touch-action", "manipulation");
  await expect(menuIcon).toHaveCount(1);
  await expect(closeIcon).toHaveCount(1);
  await expect(menuIcon).toHaveCSS("opacity", "1");
  await expect(closeIcon).toHaveCSS("opacity", "0");
  await expect(menuIcon).toHaveAttribute("stroke", "currentColor");
  await expect(closeIcon).toHaveAttribute("stroke", "currentColor");
  await expect(menuIcon).toHaveCSS("color", "rgb(0, 0, 0)");
  await expect(menuButton.locator(".mobile-menu-icon-stack")).toHaveCSS(
    "transform",
    "matrix(1, 0, 0, 1, 8, 0)",
  );
  await expect(menuButton.locator(".mobile-menu-icon-stack")).toHaveCSS(
    "pointer-events",
    "none",
  );
  await expect(page.getByLabel("Primary navigation").first()).toBeHidden();

  const [logoBox, languageBox, menuButtonBox] = await Promise.all([
    logo.boundingBox(),
    languageSwitcher.boundingBox(),
    menuButton.boundingBox(),
  ]);

  expect(logoBox).not.toBeNull();
  expect(languageBox).not.toBeNull();
  expect(menuButtonBox).not.toBeNull();
  const logoCenter = logoBox!.y + logoBox!.height / 2;
  const languageCenter = languageBox!.y + languageBox!.height / 2;
  const menuButtonCenter = menuButtonBox!.y + menuButtonBox!.height / 2;

  expect(logoBox!.height).toBe(44);
  expect(languageBox!.height).toBe(44);
  expect(menuButtonBox!.height).toBe(44);
  expect(Math.abs(logoCenter - languageCenter)).toBeLessThanOrEqual(1);
  expect(Math.abs(logoCenter - menuButtonCenter)).toBeLessThanOrEqual(1);

  const headerRight = await page
    .locator(".site-header")
    .evaluate((header) => header.getBoundingClientRect().right);
  const menuPathRight = await menuIcon.locator("path").evaluateAll((paths) =>
    Math.max(...paths.map((path) => path.getBoundingClientRect().right)),
  );

  expect(headerRight - menuPathRight).toBeGreaterThanOrEqual(5);
  expect(headerRight - menuPathRight).toBeLessThanOrEqual(7);

  const menuIconBox = await menuIcon.boundingBox();

  expect(menuIconBox).not.toBeNull();
  const menuIconCenter = {
    x: menuIconBox!.x + menuIconBox!.width / 2,
    y: menuIconBox!.y + menuIconBox!.height / 2,
  };

  if (testInfo.project.name === "mobile") {
    await page.touchscreen.tap(menuIconCenter.x, menuIconCenter.y);
  } else {
    await page.mouse.click(menuIconCenter.x, menuIconCenter.y);
  }
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: "Close navigation" })).toBeVisible();
  await expect(menuIcon).toHaveCSS("opacity", "0");
  await expect(closeIcon).toHaveCSS("opacity", "1");
  await expect(closeIcon).toHaveCSS("color", "rgb(0, 0, 0)");
  await expect(closeIcon).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  const closePathRight = await closeIcon.locator("path").evaluateAll((paths) =>
    Math.max(...paths.map((path) => path.getBoundingClientRect().right)),
  );

  expect(headerRight - closePathRight).toBeGreaterThanOrEqual(5);
  expect(headerRight - closePathRight).toBeLessThanOrEqual(7);
  const backdrop = page.locator(".mobile-menu-backdrop");
  await expect(backdrop).toHaveCSS("backdrop-filter", "blur(6px)");
  await expect(backdrop).toHaveCSS(
    "animation-name",
    "mobile-backdrop-enter, mobile-backdrop-gradient",
  );

  const mobileNavigation = page.getByLabel("Primary navigation").last();
  await expect(mobileNavigation).toBeVisible();
  await expect(mobileNavigation).toHaveCSS("border-right-width", "2px");
  await expect(mobileNavigation).not.toHaveCSS("box-shadow", "none");
  await expect(mobileNavigation).toHaveCSS(
    "animation-name",
    "mobile-menu-panel-enter",
  );
  await mobileNavigation.getByRole("link", { name: "Posts" }).click();

  await expect(page).toHaveURL(/\/en\/posts$/);
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(page.locator(".mobile-menu-backdrop")).toHaveCount(0);
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
  await expect(page.getByRole("link", { name: /fiction/i })).toBeVisible();
  await expect(page.locator(".indexed-card-title")).toHaveText([
    "Tech",
    "Essays",
    "Fiction",
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
