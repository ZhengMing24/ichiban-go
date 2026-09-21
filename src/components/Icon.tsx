import type { ReactNode } from "react";

export type IconName =
  | "wand"
  | "compass"
  | "anchor"
  | "skull"
  | "vortex"
  | "flame"
  | "glasses"
  | "smartphone"
  | "waves"
  | "sparkles"
  | "sofa"
  | "cards"
  | "moon"
  | "book"
  | "trophy"
  | "gift"
  | "frame"
  | "key"
  | "ribbon"
  | "crown";

const PATHS: Record<IconName, ReactNode> = {
  wand: (
    <>
      <path d="M4 20L15 9" />
      <path d="M17 3l.9 2.1L20 6l-2.1.9L17 9l-.9-2.1L14 6l2.1-.9z" />
      <path d="M6 6l.6 1.4L8 8l-1.4.6L6 10l-.6-1.4L4 8l1.4-.6z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15 9l-1.8 4.2L9 15l1.8-4.2z" />
    </>
  ),
  anchor: (
    <>
      <circle cx="12" cy="5" r="1.8" />
      <path d="M12 7v12" />
      <path d="M9 10h6" />
      <path d="M4 13a8 8 0 0 0 16 0" />
      <path d="M4 13h2M18 13h2" />
    </>
  ),
  skull: (
    <>
      <path d="M12 3a6.5 6.5 0 0 0-6.5 6.5v3.2l1.8 1.8v2h2.2v-2h1v2h2v-2h1v2h2.2v-2l1.8-1.8V9.5A6.5 6.5 0 0 0 12 3z" />
      <circle cx="9.3" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="10" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  vortex: (
    <>
      <path d="M12 4a8 8 0 1 0 8 8" />
      <path d="M12 7.5a4.5 4.5 0 1 0 4.5 4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  flame: (
    <path d="M12 21c3.5 0 6-2.5 6-6 0-3-2-4.8-2.7-7-.4 1.4-1.3 2.3-2 2.3.4-2.4-1-4.8-2.8-6.3-.2 2-1 3.6-2.3 5C6.8 10.4 6 12.5 6 15c0 3.5 2.5 6 6 6z" />
  ),
  glasses: (
    <>
      <circle cx="7" cy="13" r="3.2" />
      <circle cx="17" cy="13" r="3.2" />
      <path d="M10.2 13h3.6" />
      <path d="M3.8 12.2L2.5 9" />
      <path d="M20.2 12.2L21.5 9" />
    </>
  ),
  smartphone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" />
    </>
  ),
  waves: (
    <>
      <path d="M2 8.5c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0" />
      <path d="M2 13.5c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0" />
      <path d="M2 18.5c2-1.8 4-1.8 6 0s4 1.8 6 0 4-1.8 6 0" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 3.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" />
      <path d="M5 15l.5 1.4L7 17l-1.5.6L5 19l-.6-1.4L3 17l1.4-.6z" />
    </>
  ),
  sofa: (
    <>
      <path d="M5 12V8.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V12" />
      <path d="M3 12.5h18v3.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M5 18v2.2M19 18v2.2" />
    </>
  ),
  cards: (
    <>
      <rect x="3.5" y="7" width="11" height="15" rx="2" />
      <rect x="9.5" y="3" width="11" height="15" rx="2" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />,
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 5.5v15" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0z" />
      <path d="M8 5H5a3 3 0 0 0 3 3" />
      <path d="M16 5h3a3 3 0 0 1-3 3" />
      <path d="M12 12v4" />
      <path d="M9 20h6" />
      <path d="M10 20c0-1.5.8-2.5 2-2.5s2 1 2 2.5" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M4 13h16" />
      <path d="M12 9v11" />
      <path d="M12 9c-1.5-4-6-4-6-1.5S9 9 12 9zM12 9c1.5-4 6-4 6-1.5S15 9 12 9z" />
    </>
  ),
  frame: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5.5-5.5L9 17" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M11.5 11.5L20 3" />
      <path d="M16.5 7.5l2 2" />
      <path d="M19 5l2 2" />
    </>
  ),
  ribbon: (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M9 12.5L7 21l5-3 5 3-2-8.5" />
    </>
  ),
  crown: (
    <>
      <path d="M4 8l4 3 4-5 4 5 4-3-2 10H6z" />
      <path d="M6 20h12" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  className?: string;
}

export default function Icon({ name, className = "h-8 w-8" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
