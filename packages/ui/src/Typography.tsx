import React from 'react';

type TextColor = 'primary' | 'secondary' | 'muted' | 'inverse' | 'brandOrange' | 'brandRed' | 'inherit';

interface TypographyBaseProps {
  children: React.ReactNode;
  className?: string;
  color?: TextColor;
  as?: React.ElementType;
}

const colorClassMap: Record<TextColor, string> = {
  primary: 'text-[#151515]',
  secondary: 'text-[#2A2A2A]',
  muted: 'text-[#626262]',
  inverse: 'text-white',
  brandOrange: 'text-[#FF6A00]',
  brandRed: 'text-[#E52421]',
  inherit: 'text-inherit',
};

export const Display = ({
  children,
  className = '',
  color = 'primary',
  as: Component = 'h1',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[2.5rem] md:text-[3.5rem] lg:text-[4.25rem] font-bold tracking-tight leading-[1.08] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const H1 = ({
  children,
  className = '',
  color = 'primary',
  as: Component = 'h1',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold tracking-tight leading-[1.15] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const H2 = ({
  children,
  className = '',
  color = 'primary',
  as: Component = 'h2',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[1.625rem] md:text-[2rem] lg:text-[2.25rem] font-semibold tracking-tight leading-[1.2] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const H3 = ({
  children,
  className = '',
  color = 'primary',
  as: Component = 'h3',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[1.25rem] md:text-[1.5rem] font-semibold tracking-tight leading-[1.25] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const H4 = ({
  children,
  className = '',
  color = 'primary',
  as: Component = 'h4',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[1.125rem] md:text-[1.25rem] font-semibold tracking-tight leading-[1.35] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const H5 = ({
  children,
  className = '',
  color = 'primary',
  as: Component = 'h5',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[1rem] md:text-[1.0625rem] font-semibold leading-[1.4] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const H6 = ({
  children,
  className = '',
  color = 'primary',
  as: Component = 'h6',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[0.9375rem] font-semibold leading-[1.4] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const LargeBody = ({
  children,
  className = '',
  color = 'secondary',
  as: Component = 'p',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[1.125rem] font-normal leading-[1.6] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const Body = ({
  children,
  className = '',
  color = 'secondary',
  as: Component = 'p',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[0.9375rem] font-normal leading-[1.6] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const SmallBody = ({
  children,
  className = '',
  color = 'muted',
  as: Component = 'p',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[0.8125rem] font-normal leading-[1.5] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const Label = ({
  children,
  className = '',
  color = 'primary',
  as: Component = 'span',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[0.8125rem] font-semibold leading-tight tracking-[0.015em] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const Caption = ({
  children,
  className = '',
  color = 'muted',
  as: Component = 'span',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[0.75rem] font-normal leading-normal tracking-[0.01em] ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const Overline = ({
  children,
  className = '',
  color = 'muted',
  as: Component = 'span',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`text-[0.6875rem] font-bold tracking-[0.08em] uppercase ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};

export const NumericData = ({
  children,
  className = '',
  color = 'primary',
  as: Component = 'span',
}: TypographyBaseProps) => {
  return (
    <Component
      className={`font-mono text-[0.875rem] font-semibold tabular-nums tracking-tight ${colorClassMap[color]} ${className}`}
    >
      {children}
    </Component>
  );
};
