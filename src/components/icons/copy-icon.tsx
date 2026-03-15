import type { SVGProps } from 'react';

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="translate(8, 8) scale(1.23077) translate(-5.5, -6.5)">
        <path
          d="M8.02285 0.454063H1.71573C1.01907 0.454063 0.454309 1.01882 0.454309 1.71549V8.65331"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.97715 4.23833C2.97715 3.54167 3.54191 2.97691 4.23858 2.97691H9.28427C9.98093 2.97691 10.5457 3.54167 10.5457 4.23833V10.5454C10.5457 11.2421 9.98093 11.8069 9.28427 11.8069H4.23858C3.54191 11.8069 2.97715 11.2421 2.97715 10.5454V4.23833Z"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
