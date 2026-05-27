import { ImageResponse } from "next/og";
import { getPost } from "@/lib/velite";
import { SITE } from "@/lib/constants";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#ededed",
            fontSize: 48,
            fontFamily: "Geist",
          }}
        >
          {SITE.title}
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          color: "#ededed",
          padding: 80,
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", gap: 12 }}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 24,
                  color: "#9ca3af",
                  backgroundColor: "#1f2937",
                  padding: "4px 16px",
                  borderRadius: 16,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {post.title}
          </h1>
          <p style={{ fontSize: 36, color: "#9ca3af", margin: 0 }}>
            {post.description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#6b7280",
          }}
        >
          <span>{SITE.title.toLowerCase()}</span>
          <span>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
