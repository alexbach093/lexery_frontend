import type { SVGProps } from 'react';

export function SidebarToggleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect
        x="1"
        y="1"
        width="16"
        height="16"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.45"
        fill="none"
      />
      <path d="M6.5 1.25v15.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}
