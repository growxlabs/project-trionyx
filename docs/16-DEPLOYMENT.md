# 16 — Deployment

> **DEPLOYMENT & ENVIRONMENTS SPECIFICATION:**  
> Defines host environments, build pipelines, domain bindings, and operational monitoring.

---

## 1. Environments & Staging

| Environment | Purpose | URL / Host |
| :--- | :--- | :--- |
| **`local`** | Local development, interactive dev server | `http://localhost:3000` |
| **`preview`** | Pull-request branch deployments, QA audits | Vercel Preview deployments |
| **`production`** | Live public brand website & portals | Primary corporate domain (`trionyx.in` / approved domain) |

---

## 2. Build Pipeline & Quality Gates

Every pull request and build must pass:
1. **Type Checking**: `npm run type-check` (0 TypeScript errors).
2. **Lint Verification**: `npm run lint` (0 Next.js / ESLint violations).
3. **Production Build**: `npm run build` (Clean static generation and asset optimization).
4. **Bundle Inspection**: Ensure zero unoptimized external font or script imports.
