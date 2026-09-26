# 12 — Backend Architecture

> **SERVER-SIDE ARCHITECTURE & BOUNDARIES:**  
> Defines the API routes, server actions, database integration points, and operational boundaries.

---

## 1. Architectural Overview

The Trionyx backend operates primarily as a **secure API and service layer within Next.js Route Handlers and Server Actions**:
- **Stateless Session Management**: HTTP-only secure cookie sessions for authenticated roles.
- **Server-Side Validation**: Zod schema validation on all incoming forms (contact, dealer applications).
- **Service Isolation**: Private internal portal routes protected by strict server-side middleware and role checks.

---

## 2. Core Operational Modules

```text
/api
├── /auth/login                        # Authenticate dealer, distributor, or admin
├── /auth/logout                       # Invalidate session token
├── /auth/me                           # Current session identity and role
│
├── /dealer/applications               # Public dealer onboarding submissions
├── /dealer/resources                  # Authenticated brand collateral downloads
├── /dealer/warranty                   # Warranty registration submission
│
├── /contact                           # Public contact form submission
│
└── /portal/admin                      # Restricted administrative data endpoints
```

---

## 3. What is NOT Being Built Yet

To prevent premature backend complexity and unnecessary infrastructure:
- ❌ **No Consumer Shopping Cart Backend**: No cart sessions, checkout webhooks, or consumer tax calculators.
- ❌ **No Automated Payment Gateways**: No Razorpay or Stripe consumer payment routing on the public website.
- ❌ **No Real-Time Telemetry Websockets**: No persistent socket clusters or live vehicle telemetry tracking.
