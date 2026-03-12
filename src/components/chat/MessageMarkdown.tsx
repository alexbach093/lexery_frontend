'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Renders AI message content as Markdown (headings, bold, lists, blockquote, table, task list, etc.). Scoped to chat only. */
export function MessageMarkdown({ content }: { content: string }) {
  return (
    <div className="chat-assistant-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children, ...props }) => (
            <div className="chat-markdown-table-wrapper">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
