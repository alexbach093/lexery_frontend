import type { SVGProps } from 'react';

export function FileVideoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 21C5.89543 21 5 20.1046 5 19V3H14L19 8V19C19 20.1046 18.1046 21 17 21H7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13 3V9H19" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M14 14.5L11 16.2321L11 12.7679L14 14.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="11" y="14" width="2" height="1" fill="currentColor" />
    </svg>
  );
}
