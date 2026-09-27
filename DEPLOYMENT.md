# Trionyx — 100% Serverless Vercel & Supabase Deployment Guide

This guide explains how to deploy the entire Trionyx platform **100% on Vercel** using **Supabase** for the PostgreSQL database and Media Storage bucket. 

**No Docker. No VPS. No Linux servers to maintain.**

---

## Architecture Overview

```
                      +-----------------------------+
                      |         Vercel (Edge)       |
                      +-----------------------------+
                        |            |            |
                        v            v            v
                   [apps/web]  [apps/dealer] [apps/portal]
                   trionyx.in  dealers.trionyx.in ops.trionyx.in
                        |            |            |
                        +------------+------------+
                                     |
               +---------------------v---------------------+
               |              Supabase Cloud               |
               |                                           |
               |  • PostgreSQL Database (All tables/auth)  |
               |  • Storage Bucket ("trionyx-media")       |
               +-------------------------------------------+
```

---

## Step 1: Set Up Supabase (Database + Storage)

1. Go to [supabase.com](https://supabase.com) and click **Start your project** (free tier).
2. Choose your organization, name the project `trionyx-prod`, and **set a strong database password** (save this password!).
3. Choose a region close to your target users (e.g. `ap-south-1` for Mumbai / India).

### A. Run Database Schema
1. In your Supabase Dashboard, open **SQL Editor** from the left navigation.
2. Click **New query**.
3. Open [`packages/database/src/supabase_schema.sql`](./packages/database/src/supabase_schema.sql) in this repository, copy the entire SQL script, paste it into the Supabase SQL editor, and click **Run**.
4. You will see `Success. No rows returned`. All 22 tables, indexes, and constraints are now created!

### B. Create Media Storage Bucket
1. In Supabase Dashboard, click **Storage** in the left sidebar.
2. Click **New bucket**.
3. Enter bucket name: `trionyx-media`
4. Toggle **Public bucket** to **ON** (this enables public URLs for product photos & PDFs).
5. Click **Save**.

### C. Retrieve Credentials
Go to **Project Settings** -> **API**:
- Copy **Project URL**: e.g., `https://abcdefghijkl.supabase.co`
- Copy **service_role key** (secret key used server-side): `eyJhbGciOi...`

Go to **Project Settings** -> **Database**:
- Scroll to **Connection string** -> Select **URI** tab.
- Choose **Transaction pooler (port 6543)** or **Session pooler (port 5432)**:
  ```text
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
  ```
  *(Replace `[YOUR-PASSWORD]` with your actual database password).*

---

## Step 2: Push Repository to GitHub

Ensure all your latest changes are committed and pushed to your GitHub or GitLab repository:
```bash
git add .
git commit -m "Configure Supabase and Vercel production deployment"
git push origin main
```

---

## Step 3: Deploy 3 Projects in Vercel

In your [Vercel Dashboard](https://vercel.com), click **Add New... -> Project** and import your repository **3 times**:

### 1. Public Website (`trionyx-web`)
- **Project Name:** `trionyx-web`
- **Framework Preset:** `Next.js`
- **Root Directory:** Click Edit and select `apps/web`
- **Domains (Settings -> Domains):** `trionyx.in`, `www.trionyx.in`
- **Environment Variables:**
  | Variable | Value |
  | :--- | :--- |
  | `DATABASE_URL` | Your Supabase connection string (URI) |
  | `NEXT_PUBLIC_APP_URL` | `https://trionyx.in` |
  | `NEXT_PUBLIC_PORTAL_URL` | `https://ops.trionyx.in` |
  | `NEXT_PUBLIC_DEALER_PORTAL_URL` | `https://dealers.trionyx.in` |
  | `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` |
  | `NODE_ENV` | `production` |

---

### 2. Internal Operations Portal (`trionyx-portal`)
- **Project Name:** `trionyx-portal`
- **Framework Preset:** `Next.js`
- **Root Directory:** Click Edit and select `apps/portal`
- **Domains (Settings -> Domains):** `ops.trionyx.in`
- **Environment Variables:**
  | Variable | Value |
  | :--- | :--- |
  | `DATABASE_URL` | Your Supabase connection string (URI) |
  | `NEXT_PUBLIC_APP_URL` | `https://trionyx.in` |
  | `NEXT_PUBLIC_PORTAL_URL` | `https://ops.trionyx.in` |
  | `NEXT_PUBLIC_DEALER_PORTAL_URL` | `https://dealers.trionyx.in` |
  | `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` |
  | `SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` |
  | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` (Secret Service Role Key) |
  | `SUPABASE_STORAGE_BUCKET` | `trionyx-media` |
  | `NODE_ENV` | `production` |

---

### 3. Dealer Portal (`trionyx-dealer`)
- **Project Name:** `trionyx-dealer`
- **Framework Preset:** `Next.js`
- **Root Directory:** Click Edit and select `apps/dealer`
- **Domains (Settings -> Domains):** `dealers.trionyx.in`
- **Environment Variables:**
  | Variable | Value |
  | :--- | :--- |
  | `DATABASE_URL` | Your Supabase connection string (URI) |
  | `NEXT_PUBLIC_APP_URL` | `https://trionyx.in` |
  | `NEXT_PUBLIC_PORTAL_URL` | `https://ops.trionyx.in` |
  | `NEXT_PUBLIC_DEALER_PORTAL_URL` | `https://dealers.trionyx.in` |
  | `NEXT_PUBLIC_SUPABASE_URL` | `https://[PROJECT-REF].supabase.co` |
  | `NODE_ENV` | `production` |

---

## Step 4: Bootstrap First Admin / Managing Director User

To create your initial login account directly in Supabase from your local computer:

```bash
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require" pnpm internal-user:create
```

Follow the prompts:
- Enter Full Name: `e.g. John Doe`
- Enter Email Address: `admin@trionyx.in`
- Select Role: `2` (Managing Director) or `3` (Admin)
- Enter Password: `[YourSecurePassword]`

---

## Step 5: Configure DNS at Your Domain Registrar

In your DNS provider (Cloudflare, GoDaddy, Namecheap):

| Type | Host | Points To |
| :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` (Vercel IP) |
| **CNAME** | `www` | `cname.vercel-dns.com` |
| **CNAME** | `ops` | `cname.vercel-dns.com` |
| **CNAME** | `dealers` | `cname.vercel-dns.com` |

Vercel will automatically provision Let's Encrypt SSL certificates for all domains within 60 seconds!

---

## Verification & Testing Checklist

Once deployed:
1. **Public Site:** Open `https://trionyx.in`. Verify landing page, animated hero, product catalogue, and contact enquiry form.
2. **Contact Submission:** Submit a test enquiry on `https://trionyx.in/contact`.
3. **Internal Ops Login:** Open `https://ops.trionyx.in/login`. Log in with your bootstrapped Admin/MD credentials.
4. **Operations Check:** Go to `https://ops.trionyx.in/enquiries` and verify that the contact enquiry submitted from step 2 is listed in real-time.
5. **Product & Image Upload:** Go to Products -> Edit/Add Product -> Upload a photo. Verify that it uploads to the Supabase Storage bucket and displays properly.
6. **Dealer Portal:** Go to `https://dealers.trionyx.in/login` and verify access.
