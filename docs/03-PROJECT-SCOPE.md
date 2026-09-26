# 03 — Project Scope

> **BOUNDARY GUARDRAIL:**  
> This document defines the exact scope boundaries of the Trionyx web platform.  
> If a feature, page, integration, or flow is not explicitly listed as in-scope, **DO NOT BUILD IT.**

---

## 1. Public Website Scope

The public website serves brand discovery, product technical depth, customer credibility, and partner acquisition.

### In-Scope Pages & Modules:
1. **Homepage (`/`)**:
   - **Page Rails & Architectural Frame**: Stripe-inspired 1px framing enclosing the 1440px canvas.
   - **Header & Navigation**: Sticky header, logo, Products mega-menu trigger, direct links, and mobile drawer.
   - **Hero Section**: Art-directed editorial headline, supporting narrative, primary CTA (`Explore Products`), secondary CTA (`Talk to Trionyx` on desktop; hidden on mobile), and WebGL mesh gradient canvas.
   - **About Section**: Two-column layout with workshop & vehicle imagery, founding story (2006), proof point, and CTA.
   - **Reviews / Testimonials Section**: Bento grid of real studio owners and vehicle owners with 5-star ratings and quote citations.
   - **Why Trionyx (Trust) Section**: 4 clean editorial cards (Since 2006, Product Range, Dealer Support, Built for India).
   - **Network Section (Installer Network)**: Interactive geographic visualization connecting Vijayawada HQ to Indian hubs.
2. **Product Catalog & Detail Pages (`/products`, `/products/[slug]`)**:
   - Catalog index displaying certified coating lines, films, and accessories.
   - Dedicated product specification pages:
     - Ceramic Coating
     - Graphene Coating
     - Borophene Coating
     - Paint Protection Film (PPF)
   - Technical specification tables, application notes, hardness/hydrophobic ratings, and certified dealer inquiry triggers.
3. **About Page (`/about`)**:
   - Extended brand history, engineering philosophy, manufacturing and formulation standards, and company milestone timeline.
4. **Dealer Information & Application (`/dealers` or `/installer-network`)**:
   - Benefits of becoming a certified Trionyx dealer.
   - Tiered dealer benefits (support, collateral, wholesale replenishment).
   - Structured dealer onboarding application form.
5. **Contact Page (`/contact`)**:
   - Direct headquarters communication channel, studio inquiry routing, and business partnership requests.
6. **Customer Reviews Showcase (`/reviews`)**:
   - Dedicated archive of studio feedback, verified installer reviews, and vehicle owner results.
7. **Footer & Legal Infrastructure (`/privacy`, `/terms`, `/warranty`)**:
   - Structural architectural footer, copyright declarations, terms of use, privacy policy, and official warranty registration parameters.

---

## 2. Dealer Experience Scope (Portal)

A dedicated, authenticated portal designed specifically for verified detailing studios, workshops, and certified installers:

### In-Scope Dealer Features:
1. **Dealer Authentication (`/dealer/login`)**:
   - Secure credential-based access with session persistence.
2. **Dealer Dashboard (`/dealer/dashboard`)**:
   - Partner status, assigned distributor hub, quick resource links.
3. **Approved Dealer Workflows**:
   - Access to high-resolution brand assets, studio posters, and certification badges.
   - Technical product application manuals, safety data sheets (MSDS), and warranty registration submissions.
   - Wholesale product inquiry and replenishment request generation.

---

## 3. Private Internal Operations Scope

Restricted internal infrastructure for operational stakeholders, strictly separated from public access:

### In-Scope Internal Roles:
1. **Distributor Dashboard (`/portal/distributor`)**:
   - Regional dealer order tracking and inventory replenishment oversight.
2. **Managing Director / Executive View (`/portal/management`)**:
   - High-level business telemetry, network growth statistics, and dealer coverage maps.
3. **Super Admin Operations (`/portal/admin`)**:
   - User account provisioning, role management, dealer application approval/rejection, and product catalog management.

---

## 4. Explicit Out-of-Scope (DO NOT BUILD)

The following items are **strictly prohibited** unless a formal specification and approval is issued by the user:

- ❌ **Consumer E-Commerce Cart & Checkout**: No shopping carts, Stripe/Razorpay public checkout for end consumers, cart flyouts, or payment gateways on product pages.
- ❌ **Public Retail Pricing & Discounts**: No strikethrough prices, "Save 20%", promotional banners, or public price lists.
- ❌ **Appointment Booking System**: No car wash/detailing scheduling calendars or time-slot booking engines.
- ❌ **Public User Registration**: The public does NOT create consumer user accounts. Only dealers apply via structured forms, and accounts are provisioned.
- ❌ **Third-Party Marketplace Reselling**: No vendor multi-tenant marketplace or third-party seller accounts.
- ❌ **AI Chatbots / Floating Widgets**: Do not inject floating chat bubbles, AI assistants, or third-party CRM widgets unless authorized.
- ❌ **Arbitrary Social Feeds**: No live Instagram or TikTok embeds.
