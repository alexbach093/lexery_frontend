import type { SVGProps } from 'react';

export interface SidebarChatStarIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export function SidebarChatStarIcon({ filled = false, ...props }: SidebarChatStarIconProps) {
  return (
    <svg viewBox="0 0 19.0584 18.207" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.52922 0.8314L12.1095 6.42538L18.227 7.15071L13.7042 11.3333L14.9047 17.3756L9.52922 14.3666L4.15369 17.3756L5.35428 11.3333L0.831428 7.15071L6.94896 6.42538L9.52922 0.8314Z"
        stroke="currentColor"
        strokeWidth={1.44}
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}
