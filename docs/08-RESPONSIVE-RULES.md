# 08 — Responsive Rules

> **CORE RESPONSIVE PRINCIPLE:**  
> **Mobile is an intentionally composed, art-directed version of the same product—never a shrunken desktop layout.**  
> Do not simply downscale widths and font sizes. Re-sequence elements for human thumb ergonomics and vertical reading cadence.

---

## 1. Breakpoint Definitions

| Breakpoint | Minimum Width | Typical Target Devices | Architectural Rail Behavior |
| :--- | :--- | :--- | :--- |
| **`mobile`** | `< 640px` (`sm`) | iPhones, modern Android smartphones | Full width, edge-to-edge canvas, borderless rails |
| **`tablet`** | `640px`–`1023px` (`md`) | iPads, surface tablets, foldables | Inset with 1px rails (`calc(100% - 48px)`) |
| **`desktop`** | `≥ 1024px` (`lg`/`xl`) | Laptops, wide desktop displays | Max width `1440px` with persistent 1px rails |

---

## 2. Component-by-Component Responsive Specifications

### 2.1. Global Header (`HeaderShell.tsx`)
- **Desktop (`≥ 768px`)**:
  - Full desktop navbar: Logo, Products dropdown (with hover buffer), Installer Network link, About link.
  - Right utility cluster: `Contact` (outline) and `Dealer Access` (primary orange).
- **Mobile (`< 768px`)**:
  - Transparent/fluid header with Logo on left and clean 48px tactile square toggle button on right.
  - No utility buttons in the sticky bar; all links and `Dealer Access` CTA reside cleanly inside the slide-down drawer.

### 2.2. Hero Section (`HeroSection.tsx`)
- **Desktop**:
  - 12-column grid. Left 7 columns house stacked headline, supporting paragraph, and dual buttons (`Explore Products` + `Talk to Trionyx`).
  - Right 5 columns serve as spatial negative space for the WebGL ribbon.
- **Mobile**:
  - Single-column flow with maximum text width `340px` to prevent awkward word breaks.
  - **Button Rule**: **ONLY show `Explore Products` button on mobile.** The secondary `Talk to Trionyx` button is hidden (`hidden sm:inline-flex`).
  - The WebGL ribbon trajectory curves down the right flank to prevent occluding text legibility.

### 2.3. About Section (`AboutSection.tsx`)
- **Desktop**:
  - 5-column left visual stack (overlapping workshop and surface images) paired with 7-column right narrative.
- **Mobile**:
  - **Intentional Re-ordering**:
    1. Eyebrow (`ABOUT TRIONYX`)
    2. Section Title (`Two decades in the automotive industry.`)
    3. Mobile Overlapping Imagery (compact aspect ratio, clean corner radii)
    4. Two-paragraph narrative
    5. Proof line (`EST. 2006 · 20 YEARS`)
    6. Single full-width action button (`About Trionyx`)

### 2.4. Customer Reviews Section (`testimonial.tsx`)
- **Desktop**:
  - Structured 3-column bento layout displaying featured installer card, brand accent card, and owner reviews.
- **Mobile**:
  - Seamless horizontal snap-scroller (`overflow-x-auto snap-x snap-mandatory`).
  - Cards set to `w-[84vw] max-w-[340px]` with momentum scrolling and hidden scrollbars (`no-scrollbar`).

### 2.5. Why Trionyx (Trust) Section (`WhyTrionyxSection.tsx`)
- **Desktop**:
  - 1 row of 4 equal columns (`grid-template-columns: repeat(4, 1fr)`).
- **Mobile**:
  - 2 × 2 grid or stacked 1-column layout with min-height reduced to 240px per card for compact thumb travel.
