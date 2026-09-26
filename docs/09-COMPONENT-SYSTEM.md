# 09 — Component System

> **COMPONENT REUSE DIRECTIVE:**  
> All user interface elements must use approved components from `src/components/ui/` or `src/components/cards/`.  
> **Do not write ad-hoc HTML buttons, cards, or inputs.**

---

## 1. Action Buttons (`src/components/ui/Button.tsx`)

| Variant | Background | Text Color | Border | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **`primary`** | `#F26522` | `#FFFFFF` | None | Primary calls to action (`Explore Products`, `Dealer Access`) |
| **`secondary`** | `#171714` | `#FCFBF7` | None | High-contrast grounding actions |
| **`outline`** | Transparent | `#171714` | `1px solid rgba(23,23,20,0.12)` | Secondary exploration (`About Trionyx`, `Contact`) |
| **`ghost`** | Transparent | `#171714` | None | Contextual actions, text links |

### Button Sizing Tokens:
- **`sm`**: `h-8` (32px), `px-3`, text `12px font-semibold`, radius `rounded-[3px]`.
- **`md`**: `h-10` (40px), `px-4`, text `14px font-semibold`, radius `rounded-[3px]`.
- **`lg`**: `h-12` (48px), `px-6`, text `15px font-semibold`, radius `rounded-[4px]`.

---

## 2. Brand Identity: Trionyx Logo (`src/components/ui/TrionyxLogo.tsx`)

- **Format**: Pure alpha-channel transparent PNG (`/trionyx-logo-orange.png`).
- **Forbidden**: Never enclose the logo in an opaque rectangular white or cream box/banner.
- **Sizes**:
  - `sm`: `h-7 sm:h-8` (mobile header & footer)
  - `md`: `h-8 sm:h-9 lg:h-10` (desktop header standard)
  - `lg`: `h-12 sm:h-14` (splash / login panels)

---

## 3. Editorial & Typographic Primitives (`Typography.tsx`)

- **Eyebrow / Overline**: `text-[11px] sm:text-[12px] font-semibold tracking-[0.14em] uppercase text-[#68665F]`
- **Section Heading (H2)**: `text-[28px] sm:text-[36px] lg:text-[42px] font-semibold text-[#171714] tracking-[-0.025em]`
- **Editorial Paragraph**: `text-[15px] sm:text-[16px] leading-[1.65–1.70] text-[#171714] font-normal`
- **Proof Line / Metadata**: `text-[12px] font-semibold tracking-[0.16em] uppercase text-[#68665F] font-mono`

---

## 4. Specialized Cards (`src/components/cards/`)

### 4.1. Trust Bento Card (`WhyTrionyxSection`)
- **Dimensions**: Desktop min-height `300px`, mobile min-height `240px`.
- **Corner Radius**: `18px` (`rounded-[18px]`).
- **Hover**: `transform: translateY(-3px)`, shadow `0 12px 32px -8px rgba(23, 23, 20, 0.10)`.

### 4.2. Review Bento Card (`testimonial.tsx`)
- **Materials**: `#FCFBF7` elevated warm white, `#F26522` brand orange, `#171714` deep charcoal.
- **Corner Radius**: `12px` (`rounded-xl`).
- **Padding**: `24px` (`p-6`).

---

## 5. Form & Selection Controls (`src/components/ui/Forms.tsx`)

- **Text Inputs**: `h-10` (40px), radius `rounded-[4px]`, border `border-[#E5E3DB]`, focus ring `#F26522`.
- **Toggle Switches**: `36px × 20px` pill toggle with brand orange active fill.
- **Checkboxes & Radios**: `16px × 16px` with brand orange check indicator.
