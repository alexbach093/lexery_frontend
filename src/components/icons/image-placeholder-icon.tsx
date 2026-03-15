import type { SVGProps } from 'react';

export function ImagePlaceholderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="6" r="3" fill="#9A9A9A" />
      <path d="M2 24L10 10h4l8-6v20H2z" fill="#B0B0B0" />
    </svg>
  );
}
