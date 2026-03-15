import type { SVGProps } from 'react';

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 17.5 13.5" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M0.75 0.75H16.75M3.75 6.75H13.75M7.75 12.75H9.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
