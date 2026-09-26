# 11 — Frontend Architecture

> **ARCHITECTURE UNIFORMITY DIRECTIVE:**  
> All frontend code must adhere to this unified structural layout and convention.  
> Do not introduce alternate state management libraries, CSS-in-JS frameworks, or incompatible directory layouts.

---

## 1. Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Styling**: Tailwind CSS v4 (`@theme` directive in `globals.css`) + Scoped CSS Modules where complex bento styling is needed
- **Motion & Physics**: Motion (`motion/react`)
- **Type System**: Strict TypeScript (`tsconfig.json`)

---

## 2. Directory Structure

```text
src/
├── app/                               # Next.js App Router (pages, layouts, metadata)
│   ├── layout.tsx                     # Root HTML wrapper and font definitions
│   ├── globals.css                    # Tailwind v4 theme, global resets, CSS variables
│   ├── page.tsx                       # Homepage composition
│   ├── design-system/page.tsx         # Living token & component verification laboratory
│   ├── products/                      # Product index & dynamic routes
│   └── installer-network/             # Network locator and application routes
│
├── components/                        # Reusable React components
│   ├── frame/                         # PageFrame, SectionFrame, ContentGrid
│   ├── header/                        # HeaderShell, ProductsMegaMenu, MobileDrawer
│   ├── hero/                          # HeroSection, MeshGradientCanvas
│   ├── about/                         # AboutSection (narrative + visual stack)
│   ├── reviews/                       # ReviewsSection (bento testimonials)
│   ├── trust/                         # WhyTrionyxSection (4-card trust layout)
│   ├── network/                       # IndiaNetworkMap, WorldNetworkMap
│   ├── product/                       # Product spec rows, gallery thumbnails, badges
│   ├── cards/                         # Purpose-built card variants
│   └── ui/                            # Buttons, Forms, Icons, Badge, Typography, TrionyxLogo
│
├── tokens/                            # Canonical TypeScript design tokens (colors, spacing, typography)
├── lib/                               # Utility functions, cn helpers, validation
└── data/                              # Static verified product & dealer data
```

---

## 3. Server vs. Client Component Boundaries

1. **Default to Server Components**: All layout containers, static text sections, and SEO pages must remain Server Components.
2. **Restrict `'use client'` to Interactivity**:
   - WebGL shader canvas (`MeshGradientCanvas.tsx`)
   - Interactive dropdowns & drawers (`HeaderShell.tsx`)
   - Animated SVG geographic paths (`IndiaNetworkMap.tsx`)
   - Interactive forms and filter chips (`Forms.tsx`, `Badge.tsx`)

---

## 4. Styling Conventions

- **Global Tokens First**: Use Tailwind theme classes (`bg-[var(--color-surface-default)]`, `text-[var(--color-text-primary)]`).
- **No Random Arbitrary Pixels**: Adhere strictly to the 4px geometric spacing progression defined in `/docs/07-DESIGN-SYSTEM.md`.
- **Zero Style Pollution**: Do not use global tag selectors (`p { ... }`, `h1 { ... }`) that leak across unrelated components.
