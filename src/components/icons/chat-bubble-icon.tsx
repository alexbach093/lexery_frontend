import type { SVGProps } from 'react';

export function ChatBubbleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 178 178" fill="none" aria-hidden {...props}>
      <path
        d="M89 157C126.555 157 157 126.555 157 89C157 51.4446 126.555 21 89 21C51.4446 21 21 51.4446 21 89C21 100.24 23.727 110.843 28.5556 120.183L21 157L57.8167 149.444C67.1572 154.273 77.7601 157 89 157Z"
        stroke="currentColor"
        strokeWidth="15.1111"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="55.0383" cy="89.0383" r="11.3333" fill="currentColor" />
      <circle cx="89.0383" cy="89.0383" r="11.3333" fill="currentColor" />
      <circle cx="123.0383" cy="89.0383" r="11.3333" fill="currentColor" />
    </svg>
  );
}
