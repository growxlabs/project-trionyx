-- Migration: 0004_dealers_distributors
-- Canonical Dealer and Distributor Management Domain for Trionyx

-- 1. Distributors Table
CREATE TABLE IF NOT EXISTS distributors (
  id TEXT PRIMARY KEY,
  distributor_code TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  legal_name TEXT,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT NOT NULL,
  district TEXT,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  territory TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  gstin TEXT,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_distributors_code ON distributors(distributor_code);
CREATE INDEX IF NOT EXISTS idx_distributors_name ON distributors(business_name);
CREATE INDEX IF NOT EXISTS idx_distributors_status ON distributors(status);
CREATE INDEX IF NOT EXISTS idx_distributors_state ON distributors(state);
CREATE INDEX IF NOT EXISTS idx_distributors_phone ON distributors(phone);
CREATE INDEX IF NOT EXISTS idx_distributors_email ON distributors(email);

-- 2. Dealers Table
CREATE TABLE IF NOT EXISTS dealers (
  id TEXT PRIMARY KEY,
  dealer_code TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  legal_name TEXT,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  email TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT NOT NULL,
  district TEXT,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  distributor_id TEXT REFERENCES distributors(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  gstin TEXT,
  notes TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dealers_code ON dealers(dealer_code);
CREATE INDEX IF NOT EXISTS idx_dealers_distributor ON dealers(distributor_id);
CREATE INDEX IF NOT EXISTS idx_dealers_name ON dealers(business_name);
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);
CREATE INDEX IF NOT EXISTS idx_dealers_state ON dealers(state);
CREATE INDEX IF NOT EXISTS idx_dealers_city ON dealers(city);
CREATE INDEX IF NOT EXISTS idx_dealers_phone ON dealers(phone);
CREATE INDEX IF NOT EXISTS idx_dealers_email ON dealers(email);

-- 3. Dealer Distributor History (Reassignment Audit Ledger)
CREATE TABLE IF NOT EXISTS dealer_distributor_history (
  id TEXT PRIMARY KEY,
  dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  previous_distributor_id TEXT REFERENCES distributors(id) ON DELETE SET NULL,
  new_distributor_id TEXT REFERENCES distributors(id) ON DELETE SET NULL,
  reason TEXT,
  changed_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_history_dealer ON dealer_distributor_history(dealer_id);
CREATE INDEX IF NOT EXISTS idx_history_prev_dst ON dealer_distributor_history(previous_distributor_id);
CREATE INDEX IF NOT EXISTS idx_history_new_dst ON dealer_distributor_history(new_distributor_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON dealer_distributor_history(changed_at);

-- 4. Dealer Requests Table (Internal Enquiries & Requests)
CREATE TABLE IF NOT EXISTS dealer_requests (
  id TEXT PRIMARY KEY,
  request_code TEXT NOT NULL UNIQUE,
  dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('PRODUCT_ENQUIRY', 'AVAILABILITY', 'GENERAL_SUPPORT', 'OTHER')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_requests_code ON dealer_requests(request_code);
CREATE INDEX IF NOT EXISTS idx_requests_dealer ON dealer_requests(dealer_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON dealer_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON dealer_requests(type);

-- 5. Internal Notes Table
CREATE TABLE IF NOT EXISTS internal_notes (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('DEALER', 'DISTRIBUTOR')),
  entity_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_target ON internal_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_date ON internal_notes(created_at);
