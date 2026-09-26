# 07 — Design System

> **STATUS: PENDING USER LOCK**  
> This document specifies the concrete design tokens, geometry, and implementation rules.  
> Every component in `src/components` must draw directly from these tokens without inline overrides.

---

## 1. Color Palette Tokens

### 1.1. Neutral Mineral Foundation (80–85% of Viewport)
```css
--canvas:           #F5F5EE; /* Main tactile paper background (PageFrame & sections) */
--surface-elevated: #FCFBF7; /* Elevated cards, bento tiles, dialogs */
--surface-subtle:   #EFECE3; /* Inactive tags, secondary surfaces, hovers */
--surface-dark:     #171714; /* Deep charcoal dark anchor tiles (e.g. Card 01 Since 2006) */
```

### 1.2. Typography & Structural Rails (10–15% of Viewport)
```css
--text-primary:     #171714; /* Deep charcoal headings, titles, primary body */
--text-secondary:   #68665F; /* Captions, secondary descriptions, metadata */
--text-muted:       #8C897E; /* Micro-copy, inactive state indicators */
--text-inverse:     #FCFBF7; /* Text on dark anchor tiles */

--border-subtle:    rgba(23, 23, 20, 0.07); /* 1px architectural rails & horizontal rules */
--border-default:   #E5E3DB;                /* Standard component outlines */
--border-strong:    rgba(23, 23, 20, 0.12); /* Interactive controls & card borders */
```

### 1.3. Chromatic Brand Accents (~5% Concentrated Emphasis)
```css
--brand-orange:         #F26522; /* Primary CTAs, active route curves, focus rings */
--brand-orange-hover:   #DC5414; /* Interactive hover state */
--brand-orange-pressed: #C4460D; /* Active pressed state */
--brand-orange-glow:    rgba(242, 101, 34, 0.20); /* Subtle button elevation glow */

--brand-red:            #D9362B; /* Critical accents, alert pills, errors */
```

---

## 2. Typography Rules & Scales

### 2.1. Typefaces
- **Primary Editorial & Headings**: `"Instrument Sans", sans-serif`
- **Body & UI**: `"Instrument Sans", sans-serif` (or system fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
- **Monospace Technical Specs**: `var(--font-geist-mono), monospace` (Used for `tabular-nums`, technical coordinates, ratings, and spec tables)

### 2.2. Typographic Scale
| Token / Level | Desktop Size & Leading | Mobile Size & Leading | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `clamp(40px, 4.8vw, 78px)` / `0.99` | `34px` / `1.04` | 600 | `-0.035em` |
| **H1 (Page Title)** | `clamp(32px, 3.8vw, 48px)` / `1.15` | `28px` / `1.15` | 600 | `-0.025em` |
| **H2 (Section Title)**| `clamp(28px, 3.2vw, 44px)` / `1.18` | `24px` / `1.20` | 600 | `-0.025em` |
| **H3 (Card Title)** | `20px` / `1.25` | `18px` / `1.30` | 600 | `-0.020em` |
| **Body (Editorial)**| `16px` / `1.70` | `15px` / `1.65` | 400 | `0` |
| **Body (Standard)** | `15px` / `1.60` | `14px` / `1.60` | 400 | `0` |
| **Label / Button**  | `14px`–`15px` / `1.00` | `14px` / `1.00` | 600 | `0.01em` |
| **Eyebrow / Overline**| `11px`–`12px` / `1.20` | `11px` / `1.20` | 600 | `0.14em` (Uppercase) |
| **Technical Data**  | `12px`–`14px` / `1.30` | `11px`–`12px` / `1.30` | 500 / 600 | Monospace (`tabular-nums`) |

---

## 3. Geometry: Spacing, Radii & Shadows

### 3.1. Page Layout & Framing
- **Maximum Width**: `1440px` centered (`PageFrame`).
- **Architectural Rails**: `1px` continuous left and right borders (`rgba(23, 23, 20, 0.07)`).
- **Desktop Gutters**: `32px` (`px-8`).
- **Tablet Gutters**: `24px` (`px-6`).
- **Mobile Gutters**: `16px`–`20px` (`px-5`).

### 3.2. Border Radius System
- `0px` (`rounded-none`): Container intersections and horizontal section rules.
- `3px`–`4px` (`rounded-[3px]` / `rounded-[4px]`): Buttons, text inputs, filter tags, badges, image thumbnails.
- `6px` (`rounded-[6px]`): Small cards, dialog boxes, notification alerts.
- `12px`–`18px` (`rounded-xl` / `rounded-[18px]`): Large editorial bento cards (Why Trionyx cards, Testimonial cards).
- `9999px` (`rounded-full`): Reserved exclusively for status indicator pills and toggles.

### 3.3. Elevation & Shadows
- **Subtle**: `0 1px 2px 0 rgba(23, 23, 20, 0.04)`
- **Card Default**: `0 1px 3px 0 rgba(23, 23, 20, 0.04), 0 1px 2px -1px rgba(23, 23, 20, 0.04)`
- **Card Hover**: `0 12px 32px -8px rgba(23, 23, 20, 0.10)`
- **Button Glow**: `0 1px 3px rgba(242, 101, 34, 0.20)`
