'use client';

import Link from 'next/link';

export interface ProductsMegaMenuProps {
  isOpen: boolean;
  links: readonly { href: string; label: string }[];
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ProductsMegaMenu = ({ isOpen, links, onClose, onMouseEnter, onMouseLeave }: ProductsMegaMenuProps) => {
  if (!isOpen) return null;

  return (
    <div
      id="products-mega-menu"
      role="region"
      aria-label="Products"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
    >
      <ul className="w-60 rounded-2xl border border-[var(--color-hairline)] bg-[rgba(23,22,19,0.96)] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onClose}
              className="flex min-h-11 items-center rounded-xl px-3.5 text-[0.9375rem] text-[var(--color-text-muted)] transition-colors hover:bg-[rgba(236,231,222,0.06)] hover:text-[var(--color-text)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li className="mt-1 border-t border-[var(--color-hairline)] pt-1">
          <Link
            href="/products"
            onClick={onClose}
            className="flex min-h-11 items-center justify-between rounded-xl px-3.5 text-[0.9375rem] text-[var(--color-text)] transition-colors hover:bg-[rgba(236,231,222,0.06)]"
          >
            All products <span aria-hidden="true">→</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};
