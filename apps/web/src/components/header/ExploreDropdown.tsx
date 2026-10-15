'use client';

import Link from 'next/link';

export interface ExploreDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const exploreLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/gallery', label: 'Gallery' },
] as const;

export const ExploreDropdown = ({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ExploreDropdownProps) => {
  if (!isOpen) return null;

  return (
    <div
      id="explore-dropdown-menu"
      role="region"
      aria-label="Explore"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
    >
      <ul className="w-44 rounded-2xl border border-[var(--color-hairline)] bg-[rgba(23,22,19,0.96)] p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
        {exploreLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onClose}
              className="flex min-h-10 items-center rounded-xl px-3.5 text-[0.9375rem] text-[var(--color-text-muted)] transition-colors hover:bg-[rgba(236,231,222,0.06)] hover:text-[var(--color-text)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
