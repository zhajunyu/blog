import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/rss.xml",
        destination: "/en/rss.xml",
        permanent: true,
      },
      {
        source: "/posts",
        destination: "/en/posts",
        permanent: true,
      },
      {
        source: "/posts/:path*",
        destination: "/en/posts/:path*",
        permanent: true,
      },
      {
        source: "/categories",
        destination: "/en/categories",
        permanent: true,
      },
      {
        source: "/categories/:path*",
        destination: "/en/categories/:path*",
        permanent: true,
      },
      {
        source: "/tags",
        destination: "/en/tags",
        permanent: true,
      },
      {
        source: "/tags/:path*",
        destination: "/en/tags/:path*",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/en/about",
        permanent: true,
      },
      {
        source: "/projects",
        destination: "/en/projects",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/en/posts",
        permanent: true,
      },
      {
        source: "/blog/:path*",
        destination: "/en/posts/:path*",
        permanent: true,
      },
      {
        source: "/en/blog",
        destination: "/en/posts",
        permanent: true,
      },
      {
        source: "/en/blog/:path*",
        destination: "/en/posts/:path*",
        permanent: true,
      },
      {
        source: "/zh/blog",
        destination: "/zh/posts",
        permanent: true,
      },
      {
        source: "/zh/blog/:path*",
        destination: "/zh/posts/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
