import type { Locale } from "@/lib/i18n";

export type TagId =
  | "next-js"
  | "mdx"
  | "writing"
  | "engineering"
  | "bl"
  | "surge"
  | "proxy"
  | "networking"
  | "zsh"
  | "macos"
  | "terminal";
export type CategoryId = "tech" | "essays" | "fiction";

export interface Dictionary {
  site: {
    title: string;
    description: string;
  };
  nav: {
    brand: string;
    homeAria: string;
    primary: string;
    posts: string;
    category: string;
    tags: string;
    projects: string;
    rss: string;
    about: string;
    language: string;
    switchLanguage: string;
    openMenu: string;
    closeMenu: string;
  };
  search: {
    openLabel: string;
    closeLabel: string;
    title: string;
    inputLabel: string;
    placeholder: string;
    shortcut: string;
    prompt: string;
    loading: string;
    error: string;
    retry: string;
    noResults: string;
    resultCount: string;
    resultListLabel: string;
  };
  home: {
    metadataTitle: string;
    title: string;
    note: string;
    latest: string;
    allPosts: string;
  };
  posts: {
    metadataTitle: string;
    metadataDescription: string;
    title: string;
    intro: string;
  };
  tags: {
    metadataTitle: string;
    metadataDescription: string;
    title: string;
    intro: string;
    postCount: (count: number) => string;
  };
  categories: {
    order: CategoryId[];
    metadataTitle: string;
    metadataDescription: string;
    title: string;
    intro: string;
    postCount: (count: number) => string;
  };
  projects: {
    metadataTitle: string;
    metadataDescription: string;
    title: string;
    intro: string;
    items: Array<{
      name: string;
      description: string;
      href: string;
    }>;
  };
  post: {
    categoryLabel: string;
    tagsLabel: string;
    structureLabel: string;
    structureTitle: string;
    backToPosts: string;
  };
  notFound: {
    title: string;
    description: string;
    backToPosts: string;
  };
  tagLabels: Record<TagId, string>;
  categoryLabels: Record<CategoryId, string>;
  categoryDescriptions: Record<CategoryId, string>;
}

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    site: {
      title: "Junyu Zha - Notes on making, living, and imagining",
      description:
        "Technical writing, essays, and fiction about the systems we build, the lives around them, and the worlds we imagine.",
    },
    nav: {
      brand: "Junyu's Blog",
      homeAria: "Home",
      primary: "Primary navigation",
      posts: "Posts",
      category: "Categories",
      tags: "Tags",
      projects: "Projects",
      rss: "RSS",
      about: "About",
      language: "Language",
      switchLanguage: "Switch to Chinese",
      openMenu: "Open navigation",
      closeMenu: "Close navigation",
    },
    search: {
      openLabel: "Search posts",
      closeLabel: "Close search",
      title: "Search the archive",
      inputLabel: "Search English posts",
      placeholder: "Search titles, topics, and passages…",
      shortcut: "⌘K / Ctrl K",
      prompt: "Type a word or phrase to search English posts.",
      loading: "Loading the English search index…",
      error: "Search is temporarily unavailable.",
      retry: "Try again",
      noResults: "No English posts found for “{query}”.",
      resultCount: "{count} matching posts",
      resultListLabel: "English search results",
    },
    home: {
      metadataTitle: "Junyu's Blog",
      title: "Notes on making, living, and imagining.",
      note: "Technical writing, essays, and fiction about the systems we build, the lives around them, and the worlds we imagine.",
      latest: "Latest writing",
      allPosts: "All posts",
    },
    posts: {
      metadataTitle: "Posts",
      metadataDescription: "All published technical writing, essays, and fiction.",
      title: "Posts",
      intro: "Technical writing, essays, and fiction kept together in one archive.",
    },
    tags: {
      metadataTitle: "Tags",
      metadataDescription: "Browse writing by topic.",
      title: "Tags",
      intro: "Browse notes by the problems, tools, and practices they circle back to.",
      postCount: (count) => `${count} ${count === 1 ? "post" : "posts"} filed under this topic.`,
    },
    categories: {
      order: ["tech", "essays", "fiction"],
      metadataTitle: "Categories",
      metadataDescription: "Browse writing by category.",
      title: "Categories",
      intro: "Browse essays by their primary area.",
      postCount: (count) => `${count} ${count === 1 ? "post" : "posts"} in this category.`,
    },
    projects: {
      metadataTitle: "Projects",
      metadataDescription: "Selected projects and technical work.",
      title: "Projects",
      intro: "Selected things I am building, maintaining, or documenting.",
      items: [
        {
          name: "Personal Blog",
          description:
            "A static-first writing system built with Next.js, MDX, typed frontmatter, RSS, and a restrained editorial interface.",
          href: "https://github.com/zhajunyu/blog",
        },
      ],
    },
    post: {
      categoryLabel: "Category",
      tagsLabel: "Tags",
      structureLabel: "Article structure",
      structureTitle: "On this page",
      backToPosts: "Back to posts",
    },
    notFound: {
      title: "Page not found",
      description: "The page may have moved, or the post may still be a draft.",
      backToPosts: "Back to posts",
    },
    tagLabels: {
      "next-js": "Next.js",
      mdx: "MDX",
      writing: "Writing",
      engineering: "Engineering",
      bl: "BL",
      surge: "Surge",
      proxy: "Proxy",
      networking: "Networking",
      zsh: "Zsh",
      macos: "macOS",
      terminal: "Terminal",
    },
    categoryLabels: {
      tech: "Tech",
      essays: "Essays",
      fiction: "Fiction",
    },
    categoryDescriptions: {
      tech: "Engineering notes on building clear interfaces, dependable systems, and software that remains understandable over time.",
      essays: "Reflective writing on places, memory, ideas, and everyday life.",
      fiction: "Long-form fiction and stories.",
    },
  },
  zh: {
    site: {
      title: "Junyu Zha - 关于构建、生活与想象的笔记",
      description: "关于技术、生活与虚构的文章：记录我们构建的系统、身处的生活，以及想象出的世界。",
    },
    nav: {
      brand: "Junyu 的博客",
      homeAria: "首页",
      primary: "主导航",
      posts: "文章",
      category: "分类",
      tags: "标签",
      projects: "项目",
      rss: "RSS",
      about: "关于",
      language: "语言",
      switchLanguage: "切换到英文",
      openMenu: "打开导航",
      closeMenu: "关闭导航",
    },
    search: {
      openLabel: "搜索文章",
      closeLabel: "关闭搜索",
      title: "搜索文章归档",
      inputLabel: "搜索中文文章",
      placeholder: "搜索标题、主题和正文…",
      shortcut: "⌘K / Ctrl K",
      prompt: "输入关键词或短语，搜索中文文章。",
      loading: "正在加载中文搜索索引…",
      error: "搜索暂时不可用。",
      retry: "重试",
      noResults: "没有找到与“{query}”匹配的中文文章。",
      resultCount: "找到 {count} 篇文章",
      resultListLabel: "中文搜索结果",
    },
    home: {
      metadataTitle: "Junyu 的博客",
      title: "关于构建、生活与想象的笔记。",
      note: "以技术文章、随笔和小说，记录我们构建的系统、身处的生活，以及想象出的世界。",
      latest: "最新文章",
      allPosts: "全部文章",
    },
    posts: {
      metadataTitle: "文章",
      metadataDescription: "所有已发布的技术文章、随笔和小说。",
      title: "文章",
      intro: "技术文章、随笔和小说，都收在这个归档里。",
    },
    tags: {
      metadataTitle: "标签",
      metadataDescription: "按主题浏览文章。",
      title: "标签",
      intro: "按问题、工具和实践方式浏览笔记。",
      postCount: (count) => `${count} 篇文章属于这个主题。`,
    },
    categories: {
      order: ["tech", "essays", "fiction"],
      metadataTitle: "分类",
      metadataDescription: "按分类浏览文章。",
      title: "分类",
      intro: "按文章的主要领域浏览。",
      postCount: (count) => `${count} 篇文章属于这个分类。`,
    },
    projects: {
      metadataTitle: "项目",
      metadataDescription: "精选项目和技术工作。",
      title: "项目",
      intro: "我正在构建、维护或记录的一些项目。",
      items: [
        {
          name: "个人博客",
          description:
            "一个静态优先的写作系统，使用 Next.js、MDX、类型化 frontmatter、RSS 和克制的编辑式界面。",
          href: "https://github.com/zhajunyu/blog",
        },
      ],
    },
    post: {
      categoryLabel: "分类",
      tagsLabel: "标签",
      structureLabel: "文章结构",
      structureTitle: "本文结构",
      backToPosts: "返回文章",
    },
    notFound: {
      title: "页面不存在",
      description: "这个页面可能已经移动，或者文章仍然是草稿。",
      backToPosts: "返回文章",
    },
    tagLabels: {
      "next-js": "Next.js",
      mdx: "MDX",
      writing: "写作",
      engineering: "工程",
      bl: "BL",
      surge: "Surge",
      proxy: "代理",
      networking: "网络",
      zsh: "Zsh",
      macos: "macOS",
      terminal: "终端",
    },
    categoryLabels: {
      tech: "科技",
      essays: "随笔",
      fiction: "小说",
    },
    categoryDescriptions: {
      tech: "关于构建清晰界面、可靠系统，以及长期保持可理解的软件的工程笔记。",
      essays: "关于地方、记忆、想法与日常生活的思考性写作。",
      fiction: "长篇小说与故事。",
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function getTagLabel(locale: Locale, tag: string) {
  return dictionaries[locale].tagLabels[tag as TagId] ?? tag;
}

export function getCategoryLabel(locale: Locale, category: string) {
  return dictionaries[locale].categoryLabels[category as CategoryId] ?? category;
}

export function getCategoryIds(locale: Locale): CategoryId[] {
  return dictionaries[locale].categories.order;
}

export function getCategoryDescription(locale: Locale, category: string) {
  return (
    dictionaries[locale].categoryDescriptions[category as CategoryId] ??
    dictionaries[locale].categories.metadataDescription
  );
}
