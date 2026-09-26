/**
 * TRIONYX AUTOMOTIVE DESIGN SYSTEM — DESIGN TOKENS
 * Warm mineral foundation inspired by high-end editorial color proportion:
 * ~80-85% warm neutral canvas, ~10-15% typography, ~5% concentrated orange/red emphasis.
 */

export const rawColors = {
  // Brand chromatic anchors (concentrated emphasis)
  brandOrange: '#F26522',
  brandRed: '#D9362B',

  // Locked neutral foundation
  canvas: '#F5F5EE',
  elevatedSurface: '#FCFBF7',
  secondarySurface: '#EFECE3',
  border: '#E5E3DB',
  primaryText: '#171714',
  secondaryText: '#68665F',

  // Backward-compatible semantic aliases
  primaryOrange: '#F26522',
  primaryRed: '#D9362B',
  mainCanvas: '#F5F5EE',
  elevatedWhite: '#FCFBF7',
  white: '#FCFBF7',
  warmWhite: '#F5F5EE',
  deepCharcoal: '#171714',
  graphite: '#171714',
  lightGray: '#EFECE3',
  bodyGray: '#68665F',
  subtleBorder: '#E5E3DB',
  strongBorder: '#D5D2C7',
} as const;

export const semanticTokens = {
  background: {
    base: rawColors.canvas,             // #F7F6F0
    subtle: rawColors.secondarySurface, // #EFECE3
    muted: rawColors.secondarySurface,
    elevated: rawColors.elevatedSurface, // #FCFBF7
  },
  surface: {
    default: rawColors.canvas,          // #F7F6F0
    subtle: rawColors.secondarySurface, // #EFECE3
    elevated: rawColors.elevatedSurface, // #FCFBF7
    dark: rawColors.primaryText,        // #171714
  },
  text: {
    primary: rawColors.primaryText,     // #171714
    secondary: rawColors.secondaryText, // #68665F
    muted: rawColors.secondaryText,     // #68665F
    inverse: rawColors.elevatedSurface,
    accent: rawColors.brandOrange,      // #F26522
    brandRed: rawColors.brandRed,       // #D9362B
  },
  border: {
    subtle: rawColors.border,           // #E5E3DB
    default: rawColors.border,          // #E5E3DB
    strong: rawColors.strongBorder,     // #D5D2C7
    interactive: rawColors.brandOrange, // #F26522
    focus: rawColors.brandOrange,
    divider: rawColors.border,
  },
  brand: {
    primary: rawColors.brandOrange,     // #F26522
    secondary: rawColors.brandRed,      // #D9362B
    charcoal: rawColors.primaryText,
  },
  interactive: {
    hoverOrange: '#DC5414',
    pressedOrange: '#C4460D',
    hoverCharcoal: '#262622',
    pressedCharcoal: '#0D0D0B',
    hoverOutline: '#EFECE3',
    focusRing: 'rgba(242, 101, 34, 0.25)',
  },
  feedback: {
    success: '#15803D',
    successBg: '#F0FDF4',
    successBorder: '#BBF7D0',
    warning: '#B45309',
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',
    error: rawColors.brandRed,
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',
    info: rawColors.primaryText,
    infoBg: rawColors.secondarySurface,
    infoBorder: rawColors.border,
    disabledText: '#99968E',
    disabledBg: '#EFECE3',
    disabledBorder: '#E5E3DB',
  },
} as const;

export const typographyTokens = {
  fontFamily: {
    sans: 'var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'var(--font-mono), monospace',
  },
  scale: {
    display: {
      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
      lineHeight: '1.08',
      fontWeight: '700',
      letterSpacing: '-0.035em',
    },
    h1: {
      fontSize: 'clamp(2rem, 3.8vw, 3rem)',
      lineHeight: '1.15',
      fontWeight: '700',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: 'clamp(1.625rem, 2.8vw, 2.25rem)',
      lineHeight: '1.2',
      fontWeight: '600',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: 'clamp(1.25rem, 2vw, 1.625rem)',
      lineHeight: '1.25',
      fontWeight: '600',
      letterSpacing: '-0.015em',
    },
    h4: {
      fontSize: '1.25rem',
      lineHeight: '1.35',
      fontWeight: '600',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.0625rem',
      lineHeight: '1.4',
      fontWeight: '600',
      letterSpacing: '-0.005em',
    },
    h6: {
      fontSize: '0.9375rem',
      lineHeight: '1.4',
      fontWeight: '600',
      letterSpacing: '0',
    },
    largeBody: {
      fontSize: '1.125rem',
      lineHeight: '1.6',
      fontWeight: '400',
      letterSpacing: '-0.01em',
    },
    body: {
      fontSize: '0.9375rem',
      lineHeight: '1.6',
      fontWeight: '400',
      letterSpacing: '0',
    },
    smallBody: {
      fontSize: '0.8125rem',
      lineHeight: '1.5',
      fontWeight: '400',
      letterSpacing: '0.005em',
    },
    label: {
      fontSize: '0.8125rem',
      lineHeight: '1.2',
      fontWeight: '600',
      letterSpacing: '0.02em',
    },
    button: {
      fontSize: '0.875rem',
      lineHeight: '1',
      fontWeight: '600',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: '1.4',
      fontWeight: '400',
      letterSpacing: '0.01em',
    },
    overline: {
      fontSize: '0.6875rem',
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    numeric: {
      fontSize: '0.875rem',
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '-0.01em',
      fontVariantNumeric: 'tabular-nums',
    },
  },
} as const;

export const spacingTokens = {
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '40px',
  '4xl': '48px',
  '5xl': '64px',
  '6xl': '80px',
  '7xl': '96px',
  '8xl': '128px',
} as const;

export const containerTokens = {
  desktopMax: '1440px',
  wide: '1280px',
  standard: '1120px',
  narrow: '768px',
  gutters: {
    desktop: '32px',
    tablet: '24px',
    mobile: '16px',
  },
} as const;

export const radiusTokens = {
  none: '0px',
  sm: '3px',
  md: '6px',
  lg: '8px',
  pill: '9999px',
} as const;

export const borderTokens = {
  subtle: '1px solid #E5E3DB',
  default: '1px solid #E5E3DB',
  strong: '1px solid #D5D2C7',
  interactive: '1px solid #F26522',
  redAccent: '1px solid #D9362B',
  divider: '1px solid #E5E3DB',
} as const;

export const shadowTokens = {
  none: 'none',
  subtle: '0 1px 2px 0 rgba(23, 23, 20, 0.04)',
  card: '0 1px 3px 0 rgba(23, 23, 20, 0.04), 0 1px 2px -1px rgba(23, 23, 20, 0.04)',
  dropdown: '0 6px 16px -2px rgba(23, 23, 20, 0.06), 0 2px 6px -1px rgba(23, 23, 20, 0.03)',
  modal: '0 16px 32px -4px rgba(23, 23, 20, 0.08), 0 4px 12px -2px rgba(23, 23, 20, 0.04)',
} as const;

export const motionTokens = {
  duration: {
    fast: '120ms',
    standard: '200ms',
    slow: '350ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

export const zIndexTokens = {
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  tooltip: 1500,
} as const;
