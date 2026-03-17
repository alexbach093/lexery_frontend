'use client';

import type { CSSProperties } from 'react';

type EditSquareIconProps = {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  style?: CSSProperties;
  className?: string;
};

export function EditSquareIcon({
  size = 20,
  color = 'currentColor',
  strokeWidth = 14.8333,
  style,
  className,
}: EditSquareIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 157 158"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
      style={style}
    >
      <path
        d="M140.917 83.8151V113.482C140.917 133.962 124.314 150.565 103.833 150.565H44.5001C24.0195 150.565 7.41675 133.962 7.41675 113.482V54.1484C7.41675 33.6679 24.0195 17.0651 44.5001 17.0651H74.1667"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M112.526 11.7697C118.314 5.97251 127.703 5.96895 133.496 11.7617L144.541 22.807C150.284 28.5504 150.344 37.8482 144.675 43.6649L92.3132 97.3881C88.1271 101.683 82.3856 104.105 76.3904 104.105L63.8028 104.104C57.4776 104.104 52.4263 98.8312 52.6923 92.5069L53.2418 79.4421C53.4762 73.8705 55.7918 68.5898 59.7306 64.6451L112.526 11.7697Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M101.829 23.5066L131.6 53.277"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
