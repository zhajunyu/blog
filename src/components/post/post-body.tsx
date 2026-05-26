import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

export async function MdxBody({ code }: { code: string }) {
  const { default: Content } = await run(code, runtime);

  return (
    <article className="prose dark:prose-invert max-w-none">
      <Content />
    </article>
  );
}
