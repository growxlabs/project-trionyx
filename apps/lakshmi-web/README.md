# Lakshmi public website foundation

Run from the monorepo root: `pnpm --filter @trionyx/lakshmi-web dev`.
Build: `pnpm build --filter=@trionyx/lakshmi-web`.
Typecheck: `pnpm --filter @trionyx/lakshmi-web typecheck`.

## Architecture

The public presentation layer uses SiteLayout for metadata, global CSS, navigation, main content and footer. Container and Section provide layout primitives; Button renders a link when href is supplied and a native button otherwise. Catalogue cards take supplied props and omit absent optional metadata. Place cards below a section h2; card titles use h3. Product and brand links use their supplied names as accessible link text.

Prepared routes: /, /brands, /products, /about, /contact. Future /brands/[brand] and /products/[slug] will use real identifiers and shared/public APIs when supplied. Static dynamic pages need real getStaticPaths entries; no invented records or empty dynamic routes are included now. Catalogue hierarchy: distributor → brands → categories → products. No separate category route is introduced.

## Provisional visual foundation

The locked provisional palette is centralized in src/styles/tokens.css: background #F6F5F1, surface #FFFFFF, text/dark #171714, supporting text #6F6F68, border #E3E1DB, dark text #FFFFFF, primary accent #F4B400 and hover/pressed accent #D99C00. Use white for catalogue cards and elevated surfaces, and the dark-section utility for future dark sections. Amber is reserved for primary controls, active-navigation underlines, link underlines and small selected/highlight accents. Link text stays dark for readability; primary buttons use dark text on amber. Do not use amber as a large background, add gradients or introduce extra colors. This palette remains provisional pending official Lakshmi/Azoom guidelines; update centralized tokens when supplied. Typography uses the local Arial/Helvetica/system sans-serif stack; no font download. Replace tokens after brand approval. Global CSS provides responsive headings, content widths, section spacing, focus states and an automatic catalogue grid (up to four columns in the standard container, reducing with available width).

Header uses native details/summary on mobile, desktop navigation at 48rem, active links, Escape to close and outside-click dismissal. Footer contains only navigation; contact facts are omitted until supplied. No APIs, framework UI packages, production catalogue data or additional runtime dependencies are wired.

Before Step 03 supply approved Lakshmi/Azoom logos, brand colors and font direction, Home page copy/structure and approved image assets. Supply factual company/contact details before those are displayed. Real catalogue data and specifications are needed for subsequent catalogue work.
