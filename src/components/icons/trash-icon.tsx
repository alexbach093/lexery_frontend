import type { SVGProps } from 'react';

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M2.82051 4.87179V17.1795C2.82051 18.3124 3.7389 19.2308 4.8718 19.2308H13.0769C14.2098 19.2308 15.1282 18.3124 15.1282 17.1795V4.87179"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.769231 4.87179H17.1795"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.84615 4.87179L5.89744 0.769231H12.0513L14.1026 4.87179"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
