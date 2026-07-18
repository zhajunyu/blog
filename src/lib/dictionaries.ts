import type { Locale } from "@/lib/i18n";

export type TagId =
  | "next-js"
  | "mdx"
  | "writing"
  | "engineering"
  | "bl"
  | "surge"
  | "proxy"
  | "networking";
export type CategoryId = "tech" | "essays" | "fictions";

export interface Dictionary {
  site: {
    title: string;
    description: string;
  };
  nav: {
    homeAria: string;
    primary: string;
    posts: string;
    category: string;
    tags: string;
    projects: string;
    about: string;
    language: string;
  };
  footer: {
    rss: string;
    sitemap: string;
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
  about: {
    metadataTitle: string;
    metadataDescription: string;
    title: string;
    paragraphs: string[];
    sections: Array<{
      title: string;
      body: string;
    }>;
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
      title: "Junyu Zha - Notes on software and systems",
      description:
        "A personal blog about software engineering, product craft, and durable systems.",
    },
    nav: {
      homeAria: "Home",
      primary: "Primary navigation",
      posts: "Posts",
      category: "Categories",
      tags: "Tags",
      projects: "Projects",
      about: "About",
      language: "Language",
    },
    footer: {
      rss: "RSS",
      sitemap: "Sitemap",
    },
    home: {
      metadataTitle: "Junyu's Blog",
      title: "Notes on software, systems, and long-lived products.",
      note: "Writing about the practical details behind building clear interfaces, reliable systems, and software that is still understandable later.",
      latest: "Latest writing",
      allPosts: "All posts",
    },
    posts: {
      metadataTitle: "Posts",
      metadataDescription: "All published notes and essays.",
      title: "Posts",
      intro: "Essays, implementation notes, and decisions worth keeping searchable.",
    },
    tags: {
      metadataTitle: "Tags",
      metadataDescription: "Browse writing by topic.",
      title: "Tags",
      intro: "Browse notes by the problems, tools, and practices they circle back to.",
      postCount: (count) => `${count} ${count === 1 ? "post" : "posts"} filed under this topic.`,
    },
    categories: {
      order: ["tech", "essays", "fictions"],
      metadataTitle: "Categories",
      metadataDescription: "Browse writing by category.",
      title: "Categories",
      intro: "Browse essays by their primary area.",
      postCount: (count) => `${count} ${count === 1 ? "post" : "posts"} in this category.`,
    },
    about: {
      metadataTitle: "About",
      metadataDescription: "About the author and this blog.",
      title: "Junyu Zha",
      paragraphs: [
        "I write about software engineering through the lens of clarity: interfaces that stay understandable, systems that fail predictably, and product decisions that survive contact with real maintenance work.",
      ],
      sections: [
        {
          title: "What this blog is for",
          body: "This is a place for notes that are too durable for chat and too specific for generic documentation: implementation writeups, design decisions, debugging notes, and essays on engineering practice.",
        },
        {
          title: "How posts are written",
          body: "Posts live in MDX files, which keeps writing portable while still allowing custom components when an article needs a diagram, callout, or richer example.",
        },
      ],
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
    },
    categoryLabels: {
      tech: "Tech",
      essays: "Essays",
      fictions: "Fictions",
    },
    categoryDescriptions: {
      tech: "Engineering notes on building clear interfaces, dependable systems, and software that remains understandable over time.",
      essays: "Reflective writing on software, ideas, and the work of making things.",
      fictions: "Long-form fiction and stories.",
    },
  },
  zh: {
    site: {
      title: "Junyu Zha - 关于软件与系统的笔记",
      description: "关于软件工程、产品打磨和可持续系统的个人博客。",
    },
    nav: {
      homeAria: "首页",
      primary: "主导航",
      posts: "文章",
      category: "分类",
      tags: "标签",
      projects: "项目",
      about: "关于",
      language: "语言",
    },
    footer: {
      rss: "RSS",
      sitemap: "站点地图",
    },
    home: {
      metadataTitle: "Junyu 的博客",
      title: "关于软件、系统和长期产品的笔记。",
      note: "记录构建清晰界面、可靠系统，以及多年后仍然容易理解的软件时遇到的实际细节。",
      latest: "最新文章",
      allPosts: "全部文章",
    },
    posts: {
      metadataTitle: "文章",
      metadataDescription: "所有已发布的笔记和文章。",
      title: "文章",
      intro: "值得保留下来的文章、实现笔记和工程决策。",
    },
    tags: {
      metadataTitle: "标签",
      metadataDescription: "按主题浏览文章。",
      title: "标签",
      intro: "按问题、工具和实践方式浏览笔记。",
      postCount: (count) => `${count} 篇文章属于这个主题。`,
    },
    categories: {
      order: ["tech", "essays", "fictions"],
      metadataTitle: "分类",
      metadataDescription: "按分类浏览文章。",
      title: "分类",
      intro: "按文章的主要领域浏览。",
      postCount: (count) => `${count} 篇文章属于这个分类。`,
    },
    about: {
      metadataTitle: "关于",
      metadataDescription: "关于作者和这个博客。",
      title: "Junyu Zha",
      paragraphs: [
        "我从清晰性出发写软件工程：保持可理解的接口、可预测失败的系统，以及能经受维护工作的产品决策。",
      ],
      sections: [
        {
          title: "这个博客记录什么",
          body: "这里存放比聊天更持久、又比通用文档更具体的笔记：实现记录、设计决策、调试过程，以及关于工程实践的文章。",
        },
        {
          title: "文章如何编写",
          body: "文章以 MDX 文件保存，让写作保持可移植，同时在需要图表、提示块或更丰富示例时也能使用自定义组件。",
        },
      ],
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
    },
    categoryLabels: {
      tech: "科技",
      essays: "随笔",
      fictions: "小说",
    },
    categoryDescriptions: {
      tech: "关于构建清晰界面、可靠系统，以及长期保持可理解的软件的工程笔记。",
      essays: "关于软件、思想，以及创造事物过程的思考性写作。",
      fictions: "长篇小说与故事。",
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
