import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownArticle({
  markdown,
}: Readonly<{
  markdown: string;
}>) {
  return (
    <article className="text-[16px] leading-[22px] text-neutral-10">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-[18px] font-semibold text-neutral-10">
              {props.children}
            </h1>
          ),
          h2: ({ ...props }) => (
            <h2 className="mt-5 text-[16px] font-semibold text-neutral-10">
              {props.children}
            </h2>
          ),
          p: ({ ...props }) => (
            <p className="mt-4 whitespace-pre-wrap text-neutral-10">
              {props.children}
            </p>
          ),
          ul: ({ ...props }) => (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-neutral-10">
              {props.children}
            </ul>
          ),
          ol: ({ ...props }) => (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-neutral-10">
              {props.children}
            </ol>
          ),
          li: ({ ...props }) => (
            <li className="text-neutral-10">{props.children}</li>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}

