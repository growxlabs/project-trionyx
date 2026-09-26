# 13 — Authentication, Roles & Permissions

> **STRICT SECURITY DIRECTIVE:**  
> **Never determine or infer user roles from email string patterns (e.g. `@trionyx.com` or `admin@`).**  
> Role assignment and permission validation must be strictly enforced on the server via verified database records.

---

## 1. Unified Role Model

| Role Identifier | Primary Surface | Access Level & Capabilities |
| :--- | :--- | :--- |
| **`DEALER`** | `/dealer/dashboard` | View technical collaterals, submit customer warranties, request wholesale replenishment. |
| **`DISTRIBUTOR`** | `/portal/distributor` | Manage regional stock, view assigned dealers, track hub fulfillment. |
| **`MANAGING_DIRECTOR`** | `/portal/management` | Read-only executive visibility across nationwide distribution, dealer growth, and pipeline. |
| **`ADMIN`** | `/portal/admin` | Full read/write access to user management, role assignments, dealer approvals, and CMS catalog. |
| **`STAFF`** | `/portal/staff` | Operational processing for inbound inquiries and contact routing. |

---

## 2. Authentication Flow

```
1. Client submits credentials (Email + Password / 2FA) to /api/auth/login.
2. Server validates input schema and verifies password hash (Argon2 / bcrypt).
3. Server looks up User record and assigned Role from database.
4. Server generates cryptographically secure, HTTP-only, SameSite session cookie.
5. Server determines authorized dashboard target and issues redirect:
   - DEALER            → /dealer/dashboard
   - DISTRIBUTOR       → /portal/distributor
   - MANAGING_DIRECTOR → /portal/management
   - ADMIN             → /portal/admin
```

---

## 3. Surface Separation & Access Rules

- **Dealer Access (`/dealer`)**: Publicly discoverable link on the header navigation, enabling registered studios to sign in.
- **Internal Portal (`/portal`)**: Private, non-indexed route for distributors, management, and administrators. No public footer or header links.
- **Middleware Enforcement**: Any unauthorized request to `/dealer/*` or `/portal/*` immediately redirects to the respective login screen without exposing internal errors.
