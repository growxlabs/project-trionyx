import React from 'react';
import { SpinnerIcon } from './Icons';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'text' | 'destructive' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#F26522] text-white hover:bg-[#DC5414] active:bg-[#C4460D] border border-transparent shadow-[0_1px_2px_rgba(242,101,34,0.12)]',
  secondary:
    'bg-[#171714] text-[#FCFBF7] hover:bg-[#262622] active:bg-[#0D0D0B] border border-transparent shadow-[0_1px_2px_rgba(23,23,20,0.1)]',
  outline:
    'bg-transparent text-[#171714] border border-[rgba(23,23,20,0.12)] hover:border-[rgba(23,23,20,0.22)] hover:bg-[#EFECE3] active:bg-[#E5E3DB]',
  ghost:
    'bg-transparent text-[#171714] border border-transparent hover:bg-[#EFECE3] active:bg-[#E5E3DB]',
  text:
    'bg-transparent text-[#171714] hover:text-[#F26522] border-0 p-0 h-auto font-medium active:text-[#C4460D]',
  destructive:
    'bg-[#D9362B] text-white hover:bg-[#C22D22] active:bg-[#A32219] border border-transparent shadow-[0_1px_2px_rgba(217,54,43,0.15)]',
  icon:
    'bg-[#FCFBF7] text-[#171714] border border-[#E5E3DB] hover:border-[#D5D2C7] hover:bg-[#EFECE3] active:bg-[#E5E3DB] p-0 shrink-0 aspect-square justify-center',
};

const sizeStyles: Record<ButtonSize, Record<ButtonVariant, string>> = {
  sm: {
    primary: 'h-8 px-3 text-[12px] font-semibold rounded-[3px] gap-1.5',
    secondary: 'h-8 px-3 text-[12px] font-semibold rounded-[3px] gap-1.5',
    outline: 'h-8 px-3 text-[12px] font-medium rounded-[3px] gap-1.5',
    ghost: 'h-8 px-2.5 text-[12px] font-medium rounded-[3px] gap-1.5',
    text: 'text-[12px] gap-1',
    destructive: 'h-8 px-3 text-[12px] font-semibold rounded-[3px] gap-1.5',
    icon: 'w-8 h-8 rounded-[3px]',
  },
  md: {
    primary: 'h-10 px-4 text-[14px] font-semibold rounded-[3px] gap-2',
    secondary: 'h-10 px-4 text-[14px] font-semibold rounded-[3px] gap-2',
    outline: 'h-10 px-4 text-[14px] font-medium rounded-[3px] gap-2',
    ghost: 'h-10 px-3.5 text-[14px] font-medium rounded-[3px] gap-2',
    text: 'text-[14px] gap-1.5',
    destructive: 'h-10 px-4 text-[14px] font-semibold rounded-[3px] gap-2',
    icon: 'w-10 h-10 rounded-[3px]',
  },
  lg: {
    primary: 'h-12 px-6 text-[15px] font-semibold rounded-[3px] gap-2.5',
    secondary: 'h-12 px-6 text-[15px] font-semibold rounded-[3px] gap-2.5',
    outline: 'h-12 px-6 text-[15px] font-medium rounded-[3px] gap-2.5',
    ghost: 'h-12 px-5 text-[15px] font-medium rounded-[3px] gap-2.5',
    text: 'text-[15px] gap-2',
    destructive: 'h-12 px-6 text-[15px] font-semibold rounded-[3px] gap-2.5',
    icon: 'w-12 h-12 rounded-[3px]',
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      leadingIcon,
      trailingIcon,
      fullWidth = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center select-none transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none focus-visible:outline-2 focus-visible:outline-[#FF6A00] focus-visible:outline-offset-2 ${
          variantStyles[variant]
        } ${sizeStyles[size][variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {loading ? (
          <SpinnerIcon size={size === 'sm' ? 16 : 18} color="inherit" />
        ) : (
          <>
            {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
            {children && <span>{children}</span>}
            {trailingIcon && <span className="shrink-0">{trailingIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
