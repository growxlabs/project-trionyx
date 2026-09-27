# 04 — Information Architecture

> **ROUTING & HIERARCHY SOURCE OF TRUTH:**  
> All page URLs, breadcrumbs, navigation menus, and redirect targets must strictly align with this document.  
> Do not introduce arbitrary routes or restructure existing paths without explicit authorization.

---

## 1. Global Sitemap & Route Tree

```text
PUBLIC SITE
│
├── /                                      # Homepage (Hero, About, Reviews, Trust, Network)
│
├── /products                              # Complete Automotive Product Catalog
│   ├── /products/ceramic-coating          # Precision Ceramic Coating Specifications
│   ├── /products/graphene-coating         # High-End Graphene Matrix Coating
│   ├── /products/borophene-coating        # Extreme Durability Borophene Shield
│   └── /products/paint-protection-film    # Automotive PPF & Self-Healing Film
│
├── /installer-network                     # Nationwide Dealer & Studio Network Map
│   └── /installer-network/apply           # Dealer / Studio Onboarding Application
│
├── /about                                 # Company History, Heritage (Est. 2006), & Vision
├── /contact                               # Direct Inquiries & Corporate Headquarters
├── /reviews                               # Verified Studio & Vehicle Owner Testimonials
│
├── /privacy                               # Privacy Policy & Data Practices
├── /terms                                 # Terms of Service & Commercial Conditions
└── /warranty                              # Official Warranty Coverage & Verification Terms

DEALER PORTAL (Partner Authenticated)
│
├── /dealer                                # Redirects to /dealer/dashboard or /dealer/login
├── /dealer/login                          # Secure Partner Login
├── /dealer/dashboard                      # Partner Overview, Resources, & Announcements
├── /dealer/orders                         # Wholesale Inquiries & Stock Replenishment
└── /dealer/warranty-register              # Customer Warranty Submission Portal

PRIVATE INTERNAL OPERATIONS (apps/portal - Port 3002)
│
├── /login                                  # Multi-Role Internal Authentication Gateway (Step 1 Complete)
├── /overview                               # Unified Operational Shell & Overview (Step 2 Shell Complete)
│
├── /products                               # Automotive Products Master Catalog (Step 2 Complete)
│   ├── /products/new                       # Product Creation & Initial SKU Registration
│   ├── /products/[productId]               # Canonical Product Detail Master Record
│   └── /products/[productId]/edit          # Product Metadata & Technical Specification Editor
│
├── /inventory                              # Multi-Facility Inventory Balances Table (Step 2 Complete)
│   ├── /inventory/movements                # Immutable Stock Movements Ledger (Double-Entry Audit)
│   └── /inventory/locations                # Warehouses, Regional Hubs, & Transit Depots
│
├── /api/auth/login                         # Auth Login Route Handler
├── /api/auth/logout                        # Auth Logout Route Handler
├── /api/auth/me                            # Session Verification Route Handler
├── /api/categories                         # Category List & Creation Handler
├── /api/products                           # Product List & Creation Handler
├── /api/products/[id]                      # Product Detail & Update Handler
├── /api/products/[id]/archive              # Product Archival Handler
├── /api/upload                             # Multi-part Media & TDS/MSDS Document Upload Handler
├── /api/media/[id]                         # Product Media Asset Deletion Handler
├── /api/inventory/locations                # Inventory Location List & Creation Handler
├── /api/inventory/receive                  # Transactional Stock Receipt Handler
├── /api/inventory/adjust                   # Transactional Stock Adjustment Handler
├── /api/inventory/transfer                 # Transactional Inter-Facility Transfer Handler
└── /api/inventory/reorder-level            # Inventory Reorder Threshold Handler
```

---

## 2. Navigation Architecture & Menus

### 2.1. Desktop Header Navigation ([`HeaderShell.tsx`](file:///c:/growxlabs/trionyx/trion-yx/src/components/header/HeaderShell.tsx))
- **Left**: Official Trionyx Wordmark Logo (`/`).
- **Center**:
  1. **Products** (Mega Menu Trigger on hover/click with 220ms transition buffer).
  2. **Installer Network** (`/installer-network`).
  3. **About** (`/about`).
- **Right Utilities**:
  - `Contact` (Secondary outline button linking to `/contact`).
  - `Dealer Access` (Primary brand orange button linking to `/dealer`).

### 2.2. Products Mega Menu ([`ProductsMegaMenu.tsx`](file:///c:/growxlabs/trionyx/trion-yx/src/components/header/ProductsMegaMenu.tsx))
Structured across a 12-column architectural panel:
- **Columns 1–5 (Flagship Formulations)**:
  - Ceramic Coating (`/products/ceramic-coating`)
  - Graphene Coating (`/products/graphene-coating`)
  - Borophene Coating (`/products/borophene-coating`)
- **Columns 6–8 (Catalog Navigation)**:
  - All Products Index (`/products`)
  - Protective Films & PPF (`/products/paint-protection-film`)
  - Maintenance & Care
- **Columns 9–12 (Partner Callout)**:
  - Studio & Dealer certification pitch with direct button to `/dealer`.

### 2.3. Mobile Navigation Drawer
- **Trigger**: 48px tactile square toggle button with clean 20px SVG icon.
- **Drawer Content**:
  - Expandable **Products** accordion with direct product links.
  - **Installer Network** link.
  - **About** link.
  - **Contact** link.
  - Full-width **Dealer Access** primary button anchor at the bottom.

### 2.4. Global Footer Structure
- **Column 1 (Brand)**: Trionyx logo, Est. 2006 marker, corporate declaration.
- **Column 2 (Products)**: Ceramic Coating, Graphene Coating, Borophene Coating, PPF, Catalog Index.
- **Column 3 (Network & Company)**: Installer Network, About Trionyx, Customer Reviews, Contact.
- **Column 4 (Dealers & Partners)**: Dealer Access, Studio Certification, Warranty Lookup.
- **Bottom Rail**: Copyright © 2006–Present Trionyx Automotive. Privacy Policy, Terms of Service, Warranty Terms.

---

## 3. URL & Deep-Link Rules
1. **Kebab-Case Lowercase**: All paths must use lowercase kebab-case (e.g., `/products/ceramic-coating`, never `/products/CeramicCoating`).
2. **Trailing Slash Discipline**: Enforce consistent URL endings without trailing slash (configured in `next.config.ts`).
3. **No Dead Anchor Links**: Never place `<a href="#">` or `<Link href="#">`. Every interactive link must resolve to a valid path or dedicated section anchor (e.g. `/#about`).
