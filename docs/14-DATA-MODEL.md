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

### 1.2. `Distributor` & `Dealer` Management (Step 3)

- **`Distributor`**:
  - `id`: UUID (Primary Key)
  - `distributorCode`: String (Unique, Immutable, Sequential e.g. `TRX-DST-000001`)
  - `businessName`: String (e.g. "Apex Distribution North")
  - `legalName`: String (Nullable)
  - `contactPerson`: String
  - `phone`: String
  - `alternatePhone`: String (Nullable)
  - `email`: String (Nullable, Lowercase)
  - `addressLine1`, `addressLine2`: String (Nullable)
  - `city`: String
  - `district`: String (Nullable)
  - `state`: String
  - `postalCode`: String (Nullable)
  - `country`: String (Default: "India")
  - `territory`: String (Nullable)
  - `status`: Enum (`ACTIVE`, `INACTIVE`, `SUSPENDED`, Default: `ACTIVE`)
  - `gstin`: String (Nullable)
  - `notes`: Text (Nullable)
  - `createdBy`: UUID (Foreign Key to `User`)
  - `createdAt`, `updatedAt`: Timestamps

- **`Dealer`**:
  - `id`: UUID (Primary Key)
  - `dealerCode`: String (Unique, Immutable, Sequential e.g. `TRX-DLR-000001`)
  - `businessName`: String (e.g. "Speed Autohaus Studio")
  - `legalName`: String (Nullable)
  - `contactPerson`: String
  - `phone`: String (Unique per dealer network)
  - `alternatePhone`: String (Nullable)
  - `email`: String (Nullable, Lowercase)
  - `addressLine1`, `addressLine2`: String (Nullable)
  - `city`: String
  - `district`: String (Nullable)
  - `state`: String
  - `postalCode`: String (Nullable)
  - `country`: String (Default: "India")
  - `distributorId`: UUID (Nullable, Foreign Key to `Distributor`)
  - `status`: Enum (`ACTIVE`, `INACTIVE`, `SUSPENDED`, Default: `ACTIVE`)
  - `gstin`: String (Nullable)
  - `studioType`: Enum (`DETAILING_STUDIO`, `MULTI_BAY`, `BODY_SHOP`, `MOBILE_DETAILER`, `OTHER`, Nullable)
  - `bayCount`: Integer (Nullable)
  - `brandsCarried`: JSON Array (Nullable)
  - `notes`: Text (Nullable)
  - `createdBy`: UUID (Foreign Key to `User`)
  - `createdAt`, `updatedAt`: Timestamps
  - **Duplicate Validation**: Guaranteed uniqueness checks across `phone`, non-null `email`, and non-null `gstin`.

- **`DealerDistributorHistory` (Immutable Reassignment Ledger)**:
  - `id`: UUID (Primary Key)
  - `dealerId`: UUID (Foreign Key to `Dealer`)
  - `previousDistributorId`: UUID (Nullable, Foreign Key to `Distributor`)
  - `newDistributorId`: UUID (Nullable, Foreign Key to `Distributor`)
  - `reason`: Text (Mandatory, Minimum 3 characters)
  - `changedBy`: UUID (Foreign Key to `User`)
  - `createdAt`: Timestamp (Immutable, append-only)

- **`DealerRequest` (Operational Requests & Issues)**:
  - `id`: UUID (Primary Key)
  - `requestCode`: String (Unique, Immutable, Sequential e.g. `TRX-REQ-000001`)
  - `dealerId`: UUID (Foreign Key to `Dealer`)
  - `productId`: UUID (Nullable, Foreign Key to `Product`)
  - `type`: Enum (`PRODUCT_ENQUIRY`, `AVAILABILITY`, `GENERAL_SUPPORT`, `OTHER`)
  - `subject`: String
  - `description`: Text
  - `priority`: Enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`, Default: `MEDIUM`)
  - `status`: Enum (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, Default: `OPEN`)
  - `assignedTo`: String (Nullable)
  - `resolutionNotes`: Text (Nullable)
  - `resolvedAt`: Timestamp (Nullable, set automatically on transition to `RESOLVED`)
  - `createdBy`: String (User ID or Dealer User ID)
  - `createdAt`, `updatedAt`: Timestamps

- **`DealerRequestMessage` (Threaded Inquiry Messages)**:
  - `id`: UUID (Primary Key)
  - `requestId`: UUID (Foreign Key to `DealerRequest`, Cascade Delete)
  - `senderType`: Enum (`DEALER`, `INTERNAL`)
  - `senderId`: String (UUID of sender)
  - `senderName`: String
  - `body`: Text
  - `createdAt`: Timestamp

- **`DealerUser` (Authorized Dealer Portal Access — Step 4)**:
  - `id`: UUID (Primary Key)
  - `dealerId`: UUID (Foreign Key to `Dealer`, Cascade Delete)
  - `name`: String
  - `email`: String (Unique, Lowercase, Indexed)
  - `passwordHash`: String (Argon2id, Nullable during `INVITED` state)
  - `status`: Enum (`INVITED`, `ACTIVE`, `DISABLED`, Default: `INVITED`)
  - `invitationTokenHash`: String (SHA-256 hash of activation token, Nullable)
  - `invitationExpiresAt`: Timestamp (48-hour expiration window)
  - `resetTokenHash`: String (SHA-256 hash of password reset token, Nullable)
  - `resetExpiresAt`: Timestamp (1-hour expiration window)
  - `failedLoginCount`: Integer (Default 0, reset on successful login)
  - `lockedUntil`: Timestamp (Nullable, set to 15 minutes upon 5 consecutive failed attempts)
  - `lastLoginAt`: Timestamp (Nullable)
  - `createdBy`: UUID (Nullable, Foreign Key to internal `User` who invited)
  - `createdAt`, `updatedAt`: Timestamps

- **`DealerSession` (Dealer Portal Session Storage — Step 4)**:
  - `id`: UUID (Primary Key)
  - `dealerUserId`: UUID (Foreign Key to `DealerUser`, Cascade Delete)
  - `tokenHash`: String (SHA-256 hash of opaque token, Unique, Indexed)
  - `expiresAt`: Timestamp (7 days validity)
  - `createdAt`: Timestamp
  - `lastSeenAt`: Timestamp (Sliding activity tracker)

- **`InternalNote`**:
  - `id`: UUID (Primary Key)
  - `entityType`: Enum (`DEALER`, `DISTRIBUTOR`)
  - `entityId`: UUID
  - `body`: Text
  - `authorId`: UUID (Foreign Key to `User`)
  - `createdAt`: Timestamp

### 1.3. `Product` & `ProductCategory`
- **`ProductCategory`**:
  - `id`: UUID (Primary Key)
  - `name`: String (Unique, e.g. "Ceramic Coatings")
  - `slug`: String (Unique, e.g. `ceramic-coatings`)
  - `description`: Text (Nullable)
  - `status`: Enum (`ACTIVE`, `INACTIVE`)
  - `sortOrder`: Integer
  - `createdAt`, `updatedAt`: Timestamps

- **`Product`**:
  - `id`: UUID (Primary Key)
  - `productCode`: String (Unique, Immutable, Sequential e.g. `TRX-PROD-000001`)
  - `name`: String (e.g. "Titanium Matrix Sealant")
  - `slug`: String (Unique, e.g. `titanium-matrix-sealant`)
  - `categoryId`: UUID (Foreign Key to `ProductCategory`)
  - `shortDescription`: String (Nullable)
  - `description`: Text (Nullable)
  - `status`: Enum (`DRAFT`, `ACTIVE`, `INACTIVE`, `ARCHIVED`)
  - `publicVisibility`: Enum (`PRIVATE`, `PUBLIC`)
  - `createdBy`, `updatedBy`: UUIDs (Nullable)
  - `createdAt`, `updatedAt`: Timestamps

- **`ProductVariant` (SKU)**:
  - `id`: UUID (Primary Key)
  - `productId`: UUID (Foreign Key to `Product`, Cascade Delete)
  - `sku`: String (Unique, Uppercase, e.g. `TRX-TMS-50ML`)
  - `name`: String (e.g. "50ml Applicator Bottle")
  - `packSize`: String (e.g. "50")
  - `unit`: String (e.g. "ml", "L", "units")
  - `barcode`: String (Nullable)
  - `status`: Enum (`ACTIVE`, `INACTIVE`, `ARCHIVED`)
  - `createdAt`, `updatedAt`: Timestamps

- **`ProductSpecification`**:
  - `id`: UUID (Primary Key)
  - `productId`: UUID (Foreign Key to `Product`, Cascade Delete)
  - `label`: String (e.g. "Hardness Rating", "Cure Time")
  - `value`: String (e.g. "9H Pencil Scale", "24 Hours Initial")
  - `sortOrder`: Integer

- **`ProductMedia`**:
  - `id`: UUID (Primary Key)
  - `productId`: UUID (Foreign Key to `Product`, Cascade Delete)
  - `type`: Enum (`IMAGE`, `DOCUMENT`)
  - `storagePath`: String (e.g. `/uploads/products/sealant_xyz.jpg`)
  - `fileName`: String
  - `fileSize`: Integer (Bytes)
  - `mimeType`: String
  - `altText`: String (Nullable)
  - `sortOrder`: Integer
  - `createdAt`: Timestamp

### 1.4. `InventoryLocation`, `InventoryItem`, & `StockMovement` (Double-Entry Ledger)
- **`InventoryLocation`**:
  - `id`: UUID (Primary Key)
  - `code`: String (Unique, Uppercase, e.g. `LOC-MAIN`, `LOC-NORTH`)
  - `name`: String (e.g. "Central Warehouse")
  - `status`: Enum (`ACTIVE`, `INACTIVE`)
  - `createdAt`, `updatedAt`: Timestamps

- **`InventoryItem`**:
  - `id`: UUID (Primary Key)
  - `variantId`: UUID (Foreign Key to `ProductVariant`)
  - `locationId`: UUID (Foreign Key to `InventoryLocation`)
  - `onHand`: Integer (CHECK `on_hand >= 0`, negative inventory strictly prohibited)
  - `reserved`: Integer (Default 0, reserved for unfulfilled orders)
  - `reorderLevel`: Integer (Default 0, warning threshold)
  - Composite Unique Constraint: `(variant_id, location_id)`
  - Virtual Derived Field: `available = onHand - reserved`
  - Virtual Derived Status: `OUT_OF_STOCK` (available <= 0), `LOW_STOCK` (available <= reorderLevel), `AVAILABLE`
  - `createdAt`, `updatedAt`: Timestamps

- **`StockMovement` (Immutable Ledger)**:
  - `id`: UUID (Primary Key)
  - `movementCode`: String (Unique, Immutable, Sequential e.g. `TRX-STK-000001`)
  - `variantId`: UUID (Foreign Key to `ProductVariant`)
  - `locationId`: UUID (Foreign Key to `InventoryLocation`)
  - `type`: Enum (`RECEIVE`, `OPENING_BALANCE`, `ADJUST_INCREASE`, `ADJUST_DECREASE`, `TRANSFER_IN`, `TRANSFER_OUT`)
  - `quantity`: Integer (CHECK `quantity > 0`)
  - `quantityBefore`: Integer
  - `quantityAfter`: Integer
  - `reason`: Text (Mandatory for adjustments, e.g. "Physical count audit variance", "QC damaged")
  - `reference`: String (e.g. PO, Transfer Waybill, Batch number)
  - `notes`: Text (Nullable)
  - `createdBy`: UUID (Foreign Key to `User`)
  - `createdAt`: Timestamp (Immutable, append-only)

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

### 1.6. `ContactEnquiry` & `EnquiryNote` (Contact Enquiry & Internal Operations)
- `id`: UUID (Primary Key)
- `enquiryCode`: String (Unique, Sequential e.g. `TRX-ENQ-000001`)
- `type`: Enum (`PRODUCT_ENQUIRY`, `DEALER_ENQUIRY`, `DISTRIBUTION_ENQUIRY`, `PRODUCT_SUPPORT`, `GENERAL_ENQUIRY`)
- `fullName`: String
- `phone`: String
- `email`: String (Nullable)
- `companyName`: String (Nullable — required for Dealer/Distribution)
- `businessAddress`: String (Nullable — required for Dealer/Distribution)
- `businessType`: String (Nullable)
- `city`: String (Required base field)
- `state`: String (Required base field)
- `pincode`: String (Required base field, 6 digits)
- `territory`: String (Nullable — required for Distribution)
- `productId`: String (Nullable)
- `purchaseDealerDetails`: String (Nullable — shown for Product Support)
- `message`: Text (Required)
- `status`: Enum (`NEW`, `IN_PROGRESS`, `CLOSED`) — Default: `NEW`
- `assignedTo`: UUID (Nullable — foreign key to `users(id)`)
- `createdAt`, `updatedAt`: Timestamps

#### `EnquiryNote`
- `id`: UUID (Primary Key)
- `enquiryId`: UUID (Foreign key to `contact_enquiries(id)`)
- `body`: Text
- `createdBy`: UUID (Foreign key to `users(id)`)
- `createdAt`: Timestamp

**Public API**: `POST /api/v1/public/contact-enquiries`
- Spam Protection: Honeypot field (`website`) + IP-based rate limiting (5/hr)
- Strictly ignores/rejects internal fields (`status`, `assignedTo`, `notes`, etc.)

**Internal Operations APIs**:
- `GET /api/v1/internal/enquiries` (filtering, search, pagination)
- `GET /api/v1/internal/enquiries/:id` (detail + duplicate detection)
- `PATCH /api/v1/internal/enquiries/:id/status` (status change)
- `PATCH /api/v1/internal/enquiries/:id/assign` (operator assignment)
- `GET /api/v1/internal/enquiries/:id/notes` (list internal notes)
- `POST /api/v1/internal/enquiries/:id/notes` (add internal note)

**Permissions**:
- Managing Director / Admin: Full read/write access
- Distributor: Forbidden / No company-wide enquiry access

**Audit Events**:
- `CONTACT_ENQUIRY_CREATED`
- `CONTACT_ENQUIRY_STATUS_CHANGED`
- `CONTACT_ENQUIRY_ASSIGNED`
- `CONTACT_ENQUIRY_NOTE_ADDED`

