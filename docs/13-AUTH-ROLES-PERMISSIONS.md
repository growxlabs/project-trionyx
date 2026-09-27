# 13 — Authentication, Roles & Permissions

> **STRICT SECURITY DIRECTIVE:**  
> **Never determine or infer user roles from email string patterns (e.g. `@trionyx.com` or `admin@`).**  
> Role assignment and permission validation must be strictly enforced on the server via verified database records.

---

## 1. Unified Role Model

| Role Identifier | Primary Surface | Access Level & Capabilities |
| :--- | :--- | :--- |
| **`DEALER`** | `/dealer/dashboard` | View technical collaterals, submit customer warranties, request wholesale replenishment. *(Publicly accessible login on dealer app)* |
| **`DISTRIBUTOR`** | `/portal` (`/overview`) | Regional stock management, assigned dealer monitoring, and hub fulfillment. |
| **`MANAGING_DIRECTOR`** | `/portal` (`/overview`) | Nationwide distribution oversight, pipeline health, and strategic growth. |
| **`ADMIN`** | `/portal` (`/overview`) | Full read/write administrative access to user accounts, role delegations, and system settings. |
| **`STAFF`** | `/portal/staff` | Operational processing for inbound inquiries and contact routing. |

---

## 2. Internal Portal Authentication (Step 1 Architecture)

### 2.1. Private Entry Point Isolation
- The internal operations portal runs as `apps/portal` (default local port `3002`, production subdomain `portal.trionyx...`).
- **Zero Public Linkage**: No links to Distributor, Managing Director, or Admin login exist on the public consumer website (`apps/web`).
- The portal has one unified `/login` screen for all three internal roles. There is **no role dropdown**; the user's role is resolved securely on the server from the verified database record.

### 2.2. Password Hashing (Argon2id)
- Passwords are never stored in plaintext.
- Hashing uses **RFC 9106 Argon2id** via `@node-rs/argon2`:
  - Algorithm: Argon2id (variant 2)
  - Memory cost: `19456` KiB (19 MiB)
  - Time cost: `2` iterations
  - Parallelism: `1` thread
- Verification is performed strictly on the server in constant time, preventing timing attacks.
- Password hashes are never exposed to browser bundles, API responses, or log files.

### 2.3. Opaque Server Session Model & Cookies
- Upon successful authentication, the server generates a cryptographically secure 32-byte hex random token (`crypto.randomBytes(32)`).
- The **SHA-256 hash** of this token is stored in the `sessions` table in the database alongside `user_id`, `expires_at`, `created_at`, and `last_seen_at`.
- The raw token is returned to the client in a secure cookie:
  - Name: `trionyx_portal_session`
  - `HttpOnly: true` (inaccessible to JavaScript / XSS)
  - `Secure: true` in production environments
  - `SameSite: Lax`
  - `Path: /`
  - Session lifetime: `7 days` (sliding expiration via `lastSeenAt`)

### 2.4. Brute-Force Lockout Protection
- Failed login attempts increment `failed_login_count` on the user record.
- **Threshold**: 5 consecutive failed attempts.
- **Lockout Duration**: 15 minutes (`locked_until = now + 15m`).
- While locked, all authentication attempts return a 429 status with the safe message:
  `Unable to sign in right now. Try again later.`
- On successful login, `failed_login_count` is reset to 0 and `locked_until` is cleared.

### 2.5. Safe Error Messaging (Zero User Enumeration)
- Failed attempts (whether due to non-existent email, wrong password, or inactive account status) return the identical safe error:
  `Email or password is incorrect.`
- The server never discloses whether an account exists or what specific verification check failed.

### 2.6. Route Protection Middleware & Cache Control
- `apps/portal/src/middleware.ts` intercepts all requests:
  - Unauthenticated access to `/overview` or any protected path redirects to `/login`.
  - Authenticated requests to `/login` redirect to `/overview`.
  - Protected routes enforce `Cache-Control: no-store, max-age=0, must-revalidate` and `Pragma: no-cache`.

---

## 3. CLI Account Bootstrapping

Internal accounts are provisioned via a dedicated secure CLI bootstrap tool (UI user management is deferred to subsequent milestones):

```bash
# Interactive mode:
pnpm internal-user:create

# Non-interactive / CI mode:
pnpm internal-user:create --name "Sai Managing Director" --email "sai@trionyx.com" --role "MANAGING_DIRECTOR" --password "SecurePassword123!"
```

Allowed roles:
- `DISTRIBUTOR`
- `MANAGING_DIRECTOR`
- `ADMIN`

The script validates input via Zod, normalizes email (`trim().toLowerCase()`), hashes the password with Argon2id, inserts the user record, and records a `USER_BOOTSTRAPPED` audit log. Passwords and hashes are never printed to the terminal.

---

## 4. Audit Logging

Security-critical events are recorded in the `audit_logs` table:

| Event Identifier | Trigger Condition | Stored Metadata |
| :--- | :--- | :--- |
| **`LOGIN_SUCCESS`** | Valid credentials verified, session issued | User ID, IP address, user agent, timestamp |
| **`LOGIN_FAILURE`** | Invalid password, non-existent user, or inactive account | Attempt count, reason code, IP, user agent |
| **`ACCOUNT_LOCKED`** | 5th consecutive failed attempt reached | Lock duration (15m), IP, user agent |
| **`LOGOUT`** | Session terminated by user sign-out | User ID, IP, user agent, timestamp |
| **`USER_BOOTSTRAPPED`** | Internal account created via CLI | Role assigned, email, timestamp |

*Plaintext passwords, password hashes, and session tokens are strictly excluded from audit logs.*

---

## 5. Password Reset (Current Status)

Transactional email infrastructure (SMTP / Resend / Postmark) is not yet configured for the project. In accordance with architecture guidelines:
- No dead or mock password reset UI is displayed on `/login`.
- Self-service password reset is marked **PENDING TRANSACTIONAL EMAIL PROVISIONING**.
- Password reset will be enabled once verified email delivery credentials are provided.

---

## 6. Dealer & Distributor Permission & Scoping Matrix (Step 3)

| Operation / Capability | `MANAGING_DIRECTOR` | `ADMIN` | `DISTRIBUTOR` |
| :--- | :---: | :---: | :---: |
| **View Distributors List & Details** | Full Access (All) | Full Access (All) | Scoped to Own Record Only |
| **Create / Edit Distributor** | Allowed | Allowed | Forbidden (403) |
| **Change Distributor Status** | Allowed | Allowed | Forbidden (403) |
| **Add Distributor Internal Notes** | Allowed | Allowed | Forbidden (403) |
| **View Dealers List & Details** | Full Access (All) | Full Access (All) | Scoped to Assigned Dealers Only |
| **Create Dealer** | Allowed (Any Dist) | Allowed (Any Dist) | Allowed (Auto-scoped to Own Dist) |
| **Edit Dealer Details** | Allowed | Allowed | Scoped to Assigned Dealers Only |
| **Change Dealer Status** | Allowed | Allowed | Scoped to Assigned Dealers Only |
| **Reassign Dealer Distributor** | Allowed (Mandatory Reason) | Allowed (Mandatory Reason) | Forbidden (403) |
| **View Reassignment History Ledger** | Allowed | Allowed | Scoped (Read-only) |
| **Create / Update Dealer Requests** | Allowed | Allowed | Scoped to Assigned Dealers |
| **Add Dealer Internal Notes** | Allowed | Allowed | Scoped to Assigned Dealers |

### 6.1. Distributor Scoping Enforcement
- Scoping is enforced **server-side** in both API route handlers and Server Components via `@trionyx/auth` helper functions (`getDistributorScope(user)` and `requireInternalUser(token)`).
- If a user has `role: 'DISTRIBUTOR'`, queries are parameterized with `WHERE distributor_id = ?` (or `id = ?` for distributors).
- Any attempt by a `DISTRIBUTOR` user to read or modify a record belonging to another distributor immediately returns `403 Forbidden`.

---

## 7. Dealer Portal Authentication & Multi-Tenancy (Step 4)

### 7.1. Separate Application Surface & Port
- **Dedicated Application**: `apps/dealer` runs on local port `3001` (production: `dealers.trionyx...`).
- **Complete App Separation**: The dealer portal is a dedicated Next.js application independent of `apps/portal` (internal operations) and `apps/web` (public consumer website).
- **Navigation (5 sections)**: `Overview`, `Products`, `Availability`, `My Requests`, `My Account`.

### 7.2. Cryptographic & Database Session Isolation
- **Dealer Sessions**: Stored in `dealer_sessions` table with SHA-256 token hashing and 7-day expiration.
- **Dedicated Cookie**: `trionyx_dealer_session` (HttpOnly, SameSite: Lax, Secure in production).
- **Zero Cross-Portal Leakage**:
  - `requireInternalUser` strictly queries `sessions` joined with `users`. A dealer token is rejected with `401 Unauthorized`.
  - `requireDealerSession` strictly queries `dealer_sessions` joined with `dealer_users`. An internal token is rejected with `401 Unauthorized`.
  - Mutual rejection is verified via automated tests and live HTTP integration tests.

### 7.3. Invitation & Activation Lifecycle
1. **Invitation**: Internal users (`ADMIN`, `MANAGING_DIRECTOR`) generate an invite on the dealer detail page (`POST /api/dealers/[id]/users/invite`).
2. **Secure Token**: A 32-byte cryptographic random token is generated. Its SHA-256 hash is stored in `dealer_users.invitation_token_hash` with a 48-hour expiration.
3. **Activation**: Dealer accesses `http://localhost:3001/activate?token=...`, sets their initial password (Argon2id), transitioning status from `INVITED` to `ACTIVE`.
4. **Immediate Invalidation**: The invitation token hash and expiration are cleared upon activation.

### 7.4. Account Security, Status Enforcement & Lockout
- **Account Status**: Only `ACTIVE` dealer users can log in. `DISABLED` users are rejected.
- **Dealership Business Status**: If the dealer business itself is marked `INACTIVE` or `SUSPENDED`, login is rejected with `403 Forbidden` (`Your dealership account is currently inactive`).
- **Brute-Force Lockout**: 5 consecutive failed login attempts trigger a 15-minute lockout (`locked_until = now + 15m`). Subsequent attempts return `429 Too Many Requests`.
- **Password Security**: Passwords hashed with RFC 9106 Argon2id. Password reset uses 1-hour secure tokens.

### 7.5. Multi-Tenant Boundary & Zero Information Leakage
- **Dealership Scoping**: All dealer portal queries are server-enforced using `dealer_id = session.dealerId`. A dealer can never view or modify another dealer's data.
- **Zero Leakage**:
  - Raw inventory warehouse counts, location codes, and internal serial numbers are **strictly hidden**.
  - Availability is presented solely as discrete indicators: `AVAILABLE`, `LIMITED`, `UNAVAILABLE`.
  - Internal notes, margins, and cost fields are strictly excluded from all dealer API contracts.
- **Threaded Communication**: Dealers can create requests (`AVAILABILITY`, `PRODUCT_ENQUIRY`, `GENERAL_SUPPORT`, `OTHER`) and post in conversation threads (`dealer_request_messages`). Audit logs track actions with `userId: null` and `dealerUserId` in metadata to protect foreign key integrity.

