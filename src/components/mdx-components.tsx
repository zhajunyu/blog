import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface CalloutProps {
  title?: string;
  children: ReactNode;
}

function Callout({ title, children }: CalloutProps) {
  return (
    <aside className="mdx-callout">
      {title ? <p className="mdx-callout-title">{title}</p> : null}
      <div>{children}</div>
    </aside>
  );
}

function Anchor({ href, children, ...props }: ComponentPropsWithoutRef<"a">) {
  const isExternal = href?.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

function Code({ className, children, ...props }: ComponentPropsWithoutRef<"code">) {
  return (
    <code className={className ? `code-block-token ${className}` : undefined} {...props}>
      {children}
    </code>
  );
}

export const mdxComponents = {
  a: Anchor,
  code: Code,
  Callout,
};
