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

---

## 5. Internal Portal Architecture (`apps/portal`)

### Internal Operations themes

Before adding or restyling an Internal Operations screen, read the theme foundation in [the design system](./07-DESIGN-SYSTEM.md#internal-operations-theme-foundation). Use the semantic palette from `@trionyx/design-tokens/theme.css` and the shared `themeTokens` contract from `packages/design-tokens`. Do not add fixed light or dark colors to new portal components. Keep theme selection in the account menu (and mobile navigation drawer), and preserve `light`, `dark`, and `system` behavior.

- **Port Isolation**: Runs on port `3002`, isolated from public customer traffic on port `3000`.
- **Internal Shell (`InternalShell.tsx`)**:
  - Desktop: Fixed 250px Sidebar (`Sidebar.tsx`) with Trionyx branding and single active navigation item `Overview`. Sticky Topbar (`Topbar.tsx`) with readable role badge and user dropdown (`UserMenu.tsx`).
  - Mobile: Sticky topbar (`MobileNavigation.tsx`) with accessible slide-out drawer containing operator identity, navigation, and sign out.
  - Padding: 32px–40px desktop, 20px–24px mobile.
- **Empty State & Data Integrity**:
  - Zero fabricated business metrics. Unbuilt modules display `—` with honest status lines.
  - Recent Activity is fed strictly from real persisted SQLite `audit_logs`.
  - Attention Needed displays calm clear state (*"Nothing requires attention right now."*).
