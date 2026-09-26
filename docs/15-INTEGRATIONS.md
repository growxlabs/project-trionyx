# 15 — Integrations

> **EXTERNAL INTEGRATION PROTOCOL:**  
> Document all third-party APIs and services. Do not add unapproved external tracking scripts, CDNs, or widgets.

---

## 1. Approved Service Integrations

### 1.1. Transactional Email Service
- **Purpose**: Delivery of dealer application confirmations, contact inquiries, and internal notifications.
- **Provider**: Resend / AWS SES.
- **Security**: Server-side dispatch only via Next.js Route Handlers. Never expose API keys to client bundles.
- **Environment Variables**: `EMAIL_API_KEY`, `EMAIL_FROM_ADDRESS`, `ADMIN_NOTIFICATION_EMAIL`.

### 1.2. Media & Asset Storage
- **Purpose**: Serving high-resolution product photography, dealer certificates, and downloadable technical PDFs.
- **Provider**: Cloudflare R2 / AWS S3 / Vercel Blob.
- **Security**: Signed URLs for private dealer technical bulletins; public CDN caching for marketing images.
- **Environment Variables**: `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`.

---

## 2. Conditional / Future Integrations

- **Accounting & ERP (Tally / Zoho Books)**: Pending business specification; currently out of immediate scope.
- **Lead CRM Integration**: Inbound dealer applications exportable via standard CSV or verified webhook.
- **Analytics**: Privacy-preserving cookieless telemetry (e.g. self-hosted Plausible / Google Analytics with consent mode).
