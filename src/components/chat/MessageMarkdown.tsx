'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

/** * Renders AI message content as Markdown (headings, bold, lists, blockquote, table, task list, etc.).
 * Scoped to chat only.
 */
export function MessageMarkdown({ content }: { content: string }) {
  return (
    <div
      className={cn(
        'chat-assistant-markdown', // Keep as an identifier if needed
        'text-foreground max-w-full min-w-0 font-sans text-[15px] leading-[1.5] tracking-[0.13px] break-words',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        // Task list (GFM): - [ ] / - [x]
        "[&_input[type='checkbox']]:accent-foreground [&_input[type='checkbox']]:mr-[0.5em] [&_input[type='checkbox']]:align-middle",
        "[&_li:has(input[type='checkbox'])]:-ml-[1em] [&_li:has(input[type='checkbox'])]:list-none [&_li:has(input[type='checkbox'])::marker]:content-none",
        "[&_li:has(input[type='checkbox']:checked)]:text-muted-foreground [&_li:has(input[type='checkbox']:checked)]:line-through"
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="mt-[1em] mb-[0.5em] text-[1.75rem] leading-[1.25] font-bold"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="mt-[1em] mb-[0.5em] text-[1.5rem] leading-[1.3] font-semibold"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="mt-[0.9em] mb-[0.4em] text-[1.25rem] leading-[1.35] font-semibold"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="mt-[0.8em] mb-[0.4em] text-[1.1rem] leading-[1.4] font-semibold"
              {...props}
            />
          ),
          h5: ({ node, ...props }) => (
            <h5
              className="mt-[0.75em] mb-[0.35em] text-base leading-[1.4] font-semibold"
              {...props}
            />
          ),
          h6: ({ node, ...props }) => (
            <h6
              className="text-muted-foreground mt-[0.7em] mb-[0.35em] text-[0.9rem] leading-[1.45] font-semibold"
              {...props}
            />
          ),
          p: ({ node, ...props }) => <p className="m-0 mb-[1em] last:mb-0" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          del: ({ node, ...props }) => <del className="line-through" {...props} />,
          code: ({ node, className, ...props }) => (
            <code
              className={cn(
                'bg-muted text-foreground rounded px-[0.4em] py-[0.15em] font-mono text-[0.9em]',
                className
              )}
              {...props}
            />
          ),
          pre: ({ node, ...props }) => (
            <pre
              className={cn(
                'bg-muted my-[0.75em] mb-[1em] max-w-full min-w-0 overflow-x-auto rounded-lg p-[0.75em] px-[1em] font-mono text-[0.9em] [overflow-wrap:anywhere] break-all whitespace-pre-wrap',
                '[&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit'
              )}
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="my-[0.5em] mb-[1em] list-inside !list-disc pl-[0.5em] [&_ol]:my-[0.2em] [&_ul]:my-[0.2em]"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="my-[0.5em] mb-[1em] list-inside !list-decimal pl-[0.5em] [&_ol]:my-[0.2em] [&_ul]:my-[0.2em]"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="my-[0.25em] !list-item pl-[0.25em]" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-border text-foreground my-[0.75em] mb-[1em] border-l-4 py-[0.25em] pl-[1em]"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="bg-border my-[1em] h-px border-none" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="[&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground [&::-webkit-scrollbar-track]:bg-muted my-[0.75em] mb-[1em] touch-pan-x overflow-x-auto rounded-lg [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-track]:rounded">
              <table
                className="w-max min-w-full border-collapse rounded-lg text-[0.95em]"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="border-border bg-muted border px-[0.75em] py-[0.5em] text-left font-bold whitespace-nowrap"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border-border bg-muted border px-[0.75em] py-[0.5em] text-left whitespace-nowrap"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
