"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" className="text-teal-600 underline" />,
  ul: ({ node, ...props }) => <ul {...props} className="list-disc space-y-1 pl-5" />,
  ol: ({ node, ...props }) => <ol {...props} className="list-decimal space-y-1 pl-5" />,
  p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
  strong: ({ node, ...props }) => <strong {...props} className="font-semibold" />,
  blockquote: ({ node, ...props }) => <blockquote {...props} className="border-l-2 border-teal pl-3 italic text-muted-foreground" />,
  table: ({ node, ...props }) => <table {...props} className="my-2 w-full border-collapse text-xs" />,
  th: ({ node, ...props }) => <th {...props} className="border border-border bg-muted px-2 py-1 text-left font-semibold" />,
  td: ({ node, ...props }) => <td {...props} className="border border-border px-2 py-1" />,
  code: ({ node, ...props }) => <code {...props} className="rounded bg-muted px-1 py-0.5 font-mono text-xs" />,
};

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </div>
  );
}
