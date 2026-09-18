import React from 'react';
import { ChevronRightIcon, ArrowLeftIcon, ChevronLeftIcon } from '../ui/Icons';

/* =========================================================================
   1. NAVIGATION LINK & ACTIVE STATE
   ========================================================================= */

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

export const NavLink = ({
  children,
  active = false,
  className = '',
  href = '#',
  ...props
}: NavLinkProps) => {
  return (
    <a
      href={href}
      className={`text-[14px] font-medium transition-colors duration-150 inline-flex items-center py-2 px-3 rounded-[3px] ${
        active
          ? 'text-[#F26522] font-semibold bg-[#EFECE3]'
          : 'text-[#171714] hover:text-[#171714] hover:bg-[#EFECE3]'
      } ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

/* =========================================================================
   2. DROPDOWN & MEGA MENU ITEM
   ========================================================================= */

export interface DropdownItemProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const DropdownItem = ({
  title,
  description,
  icon,
  active = false,
  onClick,
  className = '',
}: DropdownItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-2.5 rounded-[4px] cursor-pointer transition-colors duration-150 ${
        active ? 'bg-[#FAF8F6]' : 'hover:bg-[#FAF8F6]'
      } ${className}`}
    >
      {icon && (
        <div className="w-8 h-8 rounded-[3px] bg-[#EFEDEB] flex items-center justify-center shrink-0 mt-0.5 text-[#151515]">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h6 className="text-[13px] font-semibold text-[#151515] leading-tight">{title}</h6>
        {description && (
          <p className="text-[12px] text-[#626262] mt-0.5 line-clamp-1 leading-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export const MegaMenuItem = ({
  category,
  title,
  specHighlights,
  onClick,
  className = '',
}: {
  category: string;
  title: string;
  specHighlights: string;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-3.5 bg-white border border-[#EFEDEB] rounded-[4px] hover:border-[#FF6A00] transition-all cursor-pointer group ${className}`}
    >
      <span className="text-[10px] uppercase font-mono tracking-wider text-[#FF6A00] block mb-1">
        {category}
      </span>
      <h6 className="text-[14px] font-semibold text-[#151515] group-hover:text-[#FF6A00] transition-colors">
        {title}
      </h6>
      <span className="text-[11px] font-mono text-[#626262] block mt-1">{specHighlights}</span>
    </div>
  );
};

/* =========================================================================
   3. BREADCRUMB
   ========================================================================= */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export const Breadcrumb = ({
  items,
  className = '',
}: {
  items: BreadcrumbItem[];
  className?: string;
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-[12px] font-mono ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.active;
          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              {index > 0 && <ChevronRightIcon size={12} color="muted" />}
              {isLast ? (
                <span className="text-[#151515] font-semibold" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href || '#'}
                  className="text-[#626262] hover:text-[#151515] transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

/* =========================================================================
   4. MOBILE NAVIGATION ITEM
   ========================================================================= */

export const MobileNavItem = ({
  title,
  href = '#',
  active = false,
  badge,
  onClick,
}: {
  title: string;
  href?: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center justify-between py-3.5 px-4 border-b border-[#EFEDEB] text-[15px] font-medium transition-colors ${
        active ? 'text-[#FF6A00] bg-[#FAF8F6] font-semibold' : 'text-[#151515] hover:bg-[#FAF8F6]'
      }`}
    >
      <span>{title}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-[10px] font-mono font-semibold uppercase text-[#FF6A00] bg-[#FFF7ED] px-2 py-0.5 rounded-[2px]">
            {badge}
          </span>
        )}
        <ChevronRightIcon size={16} color="muted" />
      </div>
    </a>
  );
};

/* =========================================================================
   5. BACK ACTION
   ========================================================================= */

export const BackAction = ({
  label = 'Back to catalog',
  onClick,
  className = '',
}: {
  label?: string;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-[13px] font-semibold text-[#626262] hover:text-[#151515] transition-colors cursor-pointer ${className}`}
    >
      <ArrowLeftIcon size={14} color="inherit" />
      <span>{label}</span>
    </button>
  );
};

/* =========================================================================
   6. PAGINATION
   ========================================================================= */

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) => {
  return (
    <div className={`flex items-center justify-center gap-1.5 font-mono text-[13px] ${className}`}>
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-8 h-8 rounded-[3px] border border-[#EFEDEB] bg-white flex items-center justify-center text-[#151515] hover:bg-[#FAF8F6] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeftIcon size={14} color="inherit" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-[3px] font-semibold transition-colors ${
              isCurrent
                ? 'bg-[#151515] text-white border border-[#151515]'
                : 'bg-white text-[#2A2A2A] border border-[#EFEDEB] hover:bg-[#FAF8F6]'
            }`}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-8 h-8 rounded-[3px] border border-[#EFEDEB] bg-white flex items-center justify-center text-[#151515] hover:bg-[#FAF8F6] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRightIcon size={14} color="inherit" />
      </button>
    </div>
  );
};
