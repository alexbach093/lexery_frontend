import type { SVGProps } from 'react';

export function CloseOverlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M17 7L7 17M7 7L17 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
