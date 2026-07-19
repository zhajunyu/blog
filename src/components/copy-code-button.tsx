"use client";

import { Check, Copy, TriangleAlert } from "lucide-react";
import {
  Children,
  isValidElement,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

type CopyStatus = "idle" | "copied" | "error";

type CopyCodeButtonProps = ComponentPropsWithoutRef<"pre"> & {
  "data-code-language"?: string;
};

const codeTypeLabels: Record<string, string> = {
  bash: "Bash",
  c: "C",
  cpp: "C++",
  css: "CSS",
  go: "Go",
  html: "HTML",
  ini: "INI",
  java: "Java",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  markdown: "Markdown",
  md: "Markdown",
  mdx: "MDX",
  plaintext: "Text",
  py: "Python",
  python: "Python",
  rust: "Rust",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  text: "Text",
  ts: "TypeScript",
  tsx: "TypeScript JSX",
  typescript: "TypeScript",
  yaml: "YAML",
  yml: "YAML",
};

function getCodeType(language?: string) {
  if (!language) {
    return "Code";
  }

  return codeTypeLabels[language.toLowerCase()] ?? language;
}

function getLanguageFromChildren(children: ReactNode) {
  const codeElement = Children.toArray(children).find((child) =>
    isValidElement<{ className?: string | string[] }>(child),
  );

  if (!isValidElement<{ className?: string | string[] }>(codeElement)) {
    return undefined;
  }

  const className = codeElement.props.className;
  const classes = Array.isArray(className)
    ? className
    : typeof className === "string"
      ? className.split(/\s+/)
      : [];

  return classes.find((value) => value.startsWith("language-"))?.slice("language-".length);
}

export function CopyCodeButton({
  children,
  ["data-code-language"]: language,
  ...props
}: CopyCodeButtonProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function copyCode() {
    const code = preRef.current?.querySelector("code")?.textContent;

    if (!code) {
      setStatus("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  const buttonLabel =
    status === "copied" ? "Copied" : status === "error" ? "Unable to copy code" : "Copy code";
  const codeType = getCodeType(language ?? getLanguageFromChildren(children));

  return (
    <div className="code-block-shell">
      <span className="code-block-type">{codeType}</span>
      <button
        type="button"
        className="code-copy-button"
        aria-label={buttonLabel}
        title={buttonLabel}
        onClick={copyCode}
      >
        {status === "copied" ? <Check aria-hidden="true" /> : null}
        {status === "error" ? <TriangleAlert aria-hidden="true" /> : null}
        {status === "idle" ? <Copy aria-hidden="true" /> : null}
        <span className="sr-only">{buttonLabel}</span>
      </button>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </div>
  );
}
