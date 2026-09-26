# 19 — QA & Acceptance Checklist

> **VERIFICATION GATEWAY:**  
> Before any section, component, or page is marked finished or presented for user review, all items below must be verified.

---

## Pre-Landing Verification Checklist

- [ ] **Desktop Audited (`≥ 1024px`)**:
  - Architectural framing rails (`1px`) render cleanly.
  - Typography scale and alignment match `/docs/07-DESIGN-SYSTEM.md`.
  - Negative space and column discipline follow 12-column grid.
- [ ] **Tablet Audited (`640px–1023px`)**:
  - Gutter margins scale to `24px` (`calc(100% - 48px)`).
  - Navigation wraps gracefully without horizontal overflowing.
- [ ] **Mobile Audited (`< 640px`)**:
  - Art-directed layout matches `/docs/08-RESPONSIVE-RULES.md`.
  - Hero displays ONLY the primary `Explore Products` CTA; secondary CTA is hidden.
  - Testimonial bento converts to horizontal snap-scroll.
  - No horizontal page overflow or clipping.
- [ ] **Content & Brand Integrity**:
  - Founding year states 2006 (`EST. 2006 · 20 YEARS`).
  - Zero fabricated specifications, prices, or fake claims.
  - Copy matches `/docs/05-CONTENT-SOURCE-OF-TRUTH.md`.
- [ ] **Visual & Asset Rigor**:
  - Trionyx logo has pure transparent background (no opaque banner box).
  - Background color strictly `#F5F5EE` across all consecutive sections.
  - Zero broken image links or distorted aspect ratios.
- [ ] **Interaction & Accessibility**:
  - Tab navigation functions seamlessly through all interactive triggers.
  - Focus rings render visibly in `#F26522`.
- [ ] **Code Hygiene**:
  - TypeScript compiles with 0 errors (`npm run type-check` or build passes).
  - No unapproved external dependencies or inline font hacks.
