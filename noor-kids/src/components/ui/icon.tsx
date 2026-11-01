import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "arrow"
  | "book"
  | "check"
  | "chevron"
  | "compass"
  | "flower"
  | "headphones"
  | "home"
  | "lock"
  | "mute"
  | "play"
  | "refresh"
  | "sparkle"
  | "sound"
  | "star"
  | "target";

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 16.5A2.5 2.5 0 0 1 6.5 14H20M8 7h8m-8 3h6" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  flower: <><path d="M12 12c-1.6-1.6-3.6-2-5-1.4-1.3.6-1.7 2.1-.7 3.1s2.5.6 3.1-.7C10 11.6 10.4 10 12 8.5c1.6 1.5 2 3.1 1.4 4.5-.6 1.3-2.1 1.7-3.1.7" /><circle cx="12" cy="12" r="9" /></>,
  headphones: <><path d="M3 13v-1a9 9 0 0 1 18 0v1" /><path d="M3 13h4v7H5a2 2 0 0 1-2-2zm18 0h-4v7h2a2 2 0 0 0 2-2z" /></>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2" /></>,
  mute: <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="m17 9 5 6m0-6-5 6" /></>,
  play: <path d="m8 5 11 7-11 7z" />,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 17 6l3 6M4 12l3 6a7 7 0 0 0 11.5-3" /></>,
  sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>,
  sound: <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="M17 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12" /></>,
  star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
