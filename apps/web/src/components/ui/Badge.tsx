import React from 'react';
import { CloseIcon } from './Icons';

/* =========================================================================
   CHIP COMPONENT
   Interactive, selectable, filterable category/attribute tags.
   ========================================================================= */

export type ChipVariant = 'default' | 'filter' | 'technology';
export type ChipSize = 'sm' | 'md';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onRemove?: () => void;
  size?: ChipSize;
  variant?: ChipVariant;
  leadingIcon?: React.ReactNode;
}

export const Chip = ({
  children,
  selected = false,
  onRemove,
  size = 'md',
  leadingIcon,
  disabled = false,
  className = '',
  onClick,
  ...props
}: ChipProps) => {
  const isRemovable = Boolean(onRemove);

  const baseStyles =
    'inline-flex items-center font-medium transition-all duration-150 select-none border rounded-[4px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40';

  const sizeStyles = {
    sm: 'h-6 text-[11px] px-2 gap-1',
    md: 'h-8 text-[12px] px-2.5 gap-1.5',
  }[size];

  const stateStyles = selected
    ? 'bg-[#151515] text-white border-[#151515] shadow-xs'
    : 'bg-white text-[#2A2A2A] border-[#EFEDEB] hover:border-[#D8D5D0] hover:bg-[#FAF8F6] active:bg-[#EFEDEB]';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${stateStyles} ${className}`}
      {...props}
    >
      {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
      <span>{children}</span>
      {isRemovable && !disabled && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className={`ml-0.5 rounded-sm p-0.5 hover:bg-black/10 transition-colors ${
            selected ? 'text-white hover:bg-white/20' : 'text-[#626262]'
          }`}
          aria-label="Remove filter"
        >
          <CloseIcon size={size === 'sm' ? 12 : 14} color="inherit" strokeWidth={2} />
        </span>
      )}
    </button>
  );
};

/* =========================================================================
   STATUS PILL COMPONENT
   Read-only or status indicator for availability, technical metadata, labels.
   ========================================================================= */

export type PillVariant = 'default' | 'neutral' | 'brandOrange' | 'brandRed' | 'success' | 'warning';
export type PillSize = 'sm' | 'md';

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
  size?: PillSize;
  dot?: boolean;
}

const pillVariantStyles: Record<PillVariant, string> = {
  default: 'bg-[#EFEDEB] text-[#151515] border border-transparent',
  neutral: 'bg-white text-[#2A2A2A] border border-[#EFEDEB]',
  brandOrange: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
  brandRed: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]',
  success: 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]',
  warning: 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]',
};

const dotColorMap: Record<PillVariant, string> = {
  default: 'bg-[#151515]',
  neutral: 'bg-[#626262]',
  brandOrange: 'bg-[#FF6A00]',
  brandRed: 'bg-[#E52421]',
  success: 'bg-[#16A34A]',
  warning: 'bg-[#D97706]',
};

export const Pill = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}: PillProps) => {
  const sizeStyles = {
    sm: 'h-5 px-2 text-[10px] tracking-wide font-semibold gap-1',
    md: 'h-6 px-2.5 text-[11px] tracking-wide font-semibold gap-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center uppercase rounded-full select-none ${sizeStyles} ${pillVariantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorMap[variant]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
