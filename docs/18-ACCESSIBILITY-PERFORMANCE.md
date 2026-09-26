# 18 — Accessibility & Performance

> **ACCESSIBILITY & SPEED DIRECTIVE:**  
> The site must meet WCAG 2.1 AA standards and maintain Core Web Vitals in the green across mobile and desktop.

---

## 1. Accessibility (a11y) Standards

- **Semantic HTML**: Strict hierarchical heading order (`h1` → `h2` → `h3`). Never skip heading levels for visual styling.
- **Accessible Focus Rings**: Visible high-contrast focus rings on all interactive elements:
  ```css
  :focus-visible {
    outline: 2px solid #F26522;
    outline-offset: 2px;
  }
  ```
- **Form Controls**: Every input must have an explicitly associated `<label>` or `aria-label`.
- **Contrast Ratios**: All body text must achieve at least `4.5:1` contrast against its surface. Deep charcoal `#171714` against `#F5F5EE` achieves `12.5:1` (AAA).
- **Reduced Motion**: Respect user OS preferences via `@media (prefers-reduced-motion: reduce)` by disabling WebGL displacement and framer-motion transitions.

---

## 2. Performance & Core Web Vitals

- **LCP (Largest Contentful Paint)**: `< 2.5s` on mobile 4G. Ensure Hero text and critical CSS load immediately.
- **CLS (Cumulative Layout Shift)**: `< 0.05`. Always define aspect ratios and dimensions on images and banners.
- **FID / INP (Interaction to Next Paint)**: `< 200ms`. Defer non-critical JavaScript.
- **Asset Optimization**:
  - Use `next/image` with WebP/AVIF formats, proper `sizes`, and responsive `srcset`.
  - Self-host or cleanly load Google Fonts via `next/font` to eliminate layout shifts.
