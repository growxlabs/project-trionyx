# 14 — Data Model

> **SCHEMA INTEGRITY DIRECTIVE:**  
> **No database improvisation during frontend development.**  
> All API contracts and database entities must conform to these defined schemas.

---

## 1. Core Data Entities

### 1.1. `User` & `Session`
- `id`: UUID (Primary Key)
- `email`: String (Unique, Indexed, Lowercase)
- `passwordHash`: String
- `role`: Enum (`DEALER`, `DISTRIBUTOR`, `MANAGING_DIRECTOR`, `ADMIN`, `STAFF`)
- `status`: Enum (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`)
- `createdAt`, `updatedAt`: Timestamps

### 1.2. `Dealer` & `DealerApplication`
- `id`: UUID (Primary Key)
- `studioName`: String (e.g. Apex Auto Studio)
- `ownerName`: String
- `city`: String (e.g. Hyderabad, Bengaluru)
- `state`: String
- `phone`: String
- `assignedDistributorId`: UUID (Nullable, Foreign Key to `Distributor`)
- `status`: Enum (`SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`)
- `submittedAt`, `reviewedAt`: Timestamps

### 1.3. `Product` & `ProductCategory`
- `id`: UUID (Primary Key)
- `slug`: String (Unique, e.g. `ceramic-coating`)
- `title`: String
- `tagline`: String
- `category`: Enum (`COATINGS`, `FILMS`, `CARE`, `ACCESSORIES`)
- `specifications`: JSON (Hardness, contact angle, durability, cure time)
- `isFeatured`: Boolean
- `status`: Enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`)

### 1.4. `ContactRequest`
- `id`: UUID (Primary Key)
- `name`: String
- `email`: String
- `phone`: String (Optional)
- `inquiryType`: Enum (`GENERAL`, `STUDIO_PARTNERSHIP`, `PRODUCT_INQUIRY`, `WARRANTY`)
- `message`: Text
- `status`: Enum (`NEW`, `IN_PROGRESS`, `RESOLVED`)
- `createdAt`: Timestamp

### 1.5. `CustomerReview`
- `id`: UUID (Primary Key)
- `authorName`: String
- `authorRole`: String (e.g. Lead Installer, Vehicle Owner)
- `studioName`: String
- `city`: String
- `rating`: Integer (1–5)
- `quote`: Text
- `isApproved`: Boolean (Default: `false` until admin verification)
- `createdAt`: Timestamp
