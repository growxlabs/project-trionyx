-- ====================================================================
-- TRIONYX POSTGRESQL SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor to initialize all tables & indexes.
-- ====================================================================

-- 1. Migration tracking table
CREATE TABLE IF NOT EXISTS _migrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Internal team: Admin, Managing Director, Distributor)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  last_login_at TIMESTAMPTZ,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  distributor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 3. Internal user sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 4. Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 5. Product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_status ON product_categories(status);

-- 6. Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  product_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  short_description TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED')),
  public_visibility TEXT NOT NULL DEFAULT 'PRIVATE' CHECK (public_visibility IN ('PRIVATE', 'PUBLIC')),
  dealer_visibility INTEGER NOT NULL DEFAULT 1,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(public_visibility);

-- 7. Product specifications
CREATE TABLE IF NOT EXISTS product_specifications (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_specs_product ON product_specifications(product_id);

-- 8. Product media
CREATE TABLE IF NOT EXISTS product_media (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('IMAGE', 'DOCUMENT')),
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_media_product ON product_media(product_id);

-- 9. Inventory locations
CREATE TABLE IF NOT EXISTS inventory_locations (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_locations_code ON inventory_locations(code);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_status ON inventory_locations(status);

-- 10. Serial number inventory
CREATE TABLE IF NOT EXISTS serial_numbers (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  serial_number TEXT NOT NULL UNIQUE,
  location_id TEXT NOT NULL REFERENCES inventory_locations(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'TRANSFERRED', 'INACTIVE')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_serial_numbers_sn ON serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_product ON serial_numbers(product_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_location ON serial_numbers(location_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON serial_numbers(status);

-- 11. Serial movements
CREATE TABLE IF NOT EXISTS serial_movements (
  id TEXT PRIMARY KEY,
  serial_record_id TEXT NOT NULL REFERENCES serial_numbers(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('RECEIVED', 'TRANSFERRED', 'ADJUSTED')),
  from_location_id TEXT REFERENCES inventory_locations(id) ON DELETE SET NULL,
  to_location_id TEXT REFERENCES inventory_locations(id) ON DELETE SET NULL,
  reference TEXT,
  reason TEXT,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_serial_movements_record ON serial_movements(serial_record_id);
CREATE INDEX IF NOT EXISTS idx_serial_movements_product ON serial_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_serial_movements_type ON serial_movements(type);
CREATE INDEX IF NOT EXISTS idx_serial_movements_created ON serial_movements(created_at);

-- 12. Distributors
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_distributors_code ON distributors(distributor_code);
CREATE INDEX IF NOT EXISTS idx_distributors_name ON distributors(business_name);
CREATE INDEX IF NOT EXISTS idx_distributors_status ON distributors(status);
CREATE INDEX IF NOT EXISTS idx_distributors_state ON distributors(state);
CREATE INDEX IF NOT EXISTS idx_distributors_phone ON distributors(phone);
CREATE INDEX IF NOT EXISTS idx_distributors_email ON distributors(email);

-- Add foreign key constraint to users(distributor_id) if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_users_distributor' AND table_name = 'users'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT fk_users_distributor
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 13. Dealers
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dealers_code ON dealers(dealer_code);
CREATE INDEX IF NOT EXISTS idx_dealers_distributor ON dealers(distributor_id);
CREATE INDEX IF NOT EXISTS idx_dealers_name ON dealers(business_name);
CREATE INDEX IF NOT EXISTS idx_dealers_status ON dealers(status);
CREATE INDEX IF NOT EXISTS idx_dealers_state ON dealers(state);
CREATE INDEX IF NOT EXISTS idx_dealers_city ON dealers(city);
CREATE INDEX IF NOT EXISTS idx_dealers_phone ON dealers(phone);
CREATE INDEX IF NOT EXISTS idx_dealers_email ON dealers(email);

-- 14. Dealer-distributor history
CREATE TABLE IF NOT EXISTS dealer_distributor_history (
  id TEXT PRIMARY KEY,
  dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  previous_distributor_id TEXT REFERENCES distributors(id) ON DELETE SET NULL,
  new_distributor_id TEXT REFERENCES distributors(id) ON DELETE SET NULL,
  reason TEXT,
  changed_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_history_dealer ON dealer_distributor_history(dealer_id);
CREATE INDEX IF NOT EXISTS idx_history_prev_dst ON dealer_distributor_history(previous_distributor_id);
CREATE INDEX IF NOT EXISTS idx_history_new_dst ON dealer_distributor_history(new_distributor_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON dealer_distributor_history(changed_at);

-- 15. Dealer requests
CREATE TABLE IF NOT EXISTS dealer_requests (
  id TEXT PRIMARY KEY,
  request_code TEXT NOT NULL UNIQUE,
  dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('PRODUCT_ENQUIRY', 'AVAILABILITY', 'GENERAL_SUPPORT', 'OTHER')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_requests_code ON dealer_requests(request_code);
CREATE INDEX IF NOT EXISTS idx_requests_dealer ON dealer_requests(dealer_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON dealer_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON dealer_requests(type);

-- 16. Internal notes (for dealers and distributors)
CREATE TABLE IF NOT EXISTS internal_notes (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('DEALER', 'DISTRIBUTOR')),
  entity_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_target ON internal_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_date ON internal_notes(created_at);

-- 17. Dealer users (portal accounts)
CREATE TABLE IF NOT EXISTS dealer_users (
  id TEXT PRIMARY KEY,
  dealer_id TEXT NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  status TEXT NOT NULL DEFAULT 'INVITED' CHECK (status IN ('INVITED', 'ACTIVE', 'DISABLED')),
  invitation_token_hash TEXT,
  invitation_expires_at TIMESTAMPTZ,
  reset_token_hash TEXT,
  reset_expires_at TIMESTAMPTZ,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dealer_users_email ON dealer_users(email);
CREATE INDEX IF NOT EXISTS idx_dealer_users_dealer ON dealer_users(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_users_status ON dealer_users(status);
CREATE INDEX IF NOT EXISTS idx_dealer_users_invite ON dealer_users(invitation_token_hash);
CREATE INDEX IF NOT EXISTS idx_dealer_users_reset ON dealer_users(reset_token_hash);

-- 18. Dealer sessions
CREATE TABLE IF NOT EXISTS dealer_sessions (
  id TEXT PRIMARY KEY,
  dealer_user_id TEXT NOT NULL REFERENCES dealer_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dealer_sessions_token_hash ON dealer_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_dealer_sessions_user ON dealer_sessions(dealer_user_id);

-- 19. Dealer request messages
CREATE TABLE IF NOT EXISTS dealer_request_messages (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES dealer_requests(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('DEALER', 'INTERNAL')),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_drm_request ON dealer_request_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_drm_created ON dealer_request_messages(created_at);

-- 20. Public contact enquiries
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id TEXT PRIMARY KEY,
  enquiry_code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('PRODUCT_ENQUIRY', 'DEALER_ENQUIRY', 'DISTRIBUTION_ENQUIRY', 'PRODUCT_SUPPORT', 'GENERAL_ENQUIRY')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company_name TEXT,
  business_address TEXT,
  business_type TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  territory TEXT,
  product_id TEXT,
  purchase_dealer_details TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'CLOSED', 'REVIEWED', 'RESPONDED')),
  assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_enquiries_code ON contact_enquiries(enquiry_code);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_type ON contact_enquiries(type);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status ON contact_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_email ON contact_enquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created ON contact_enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_assigned ON contact_enquiries(assigned_to);

-- 21. Enquiry internal notes
CREATE TABLE IF NOT EXISTS enquiry_notes (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL REFERENCES contact_enquiries(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enquiry_notes_enquiry ON enquiry_notes(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_notes_created ON enquiry_notes(created_at);

-- 22. Warranty policies
CREATE TABLE IF NOT EXISTS warranty_policies (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  duration_months INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warranty_policies_product ON warranty_policies(product_id);

-- 23. Warranties
CREATE TABLE IF NOT EXISTS warranties (
  id TEXT PRIMARY KEY,
  serial_record_id TEXT NOT NULL UNIQUE REFERENCES serial_numbers(id) ON DELETE RESTRICT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  dealer_id TEXT REFERENCES dealers(id) ON DELETE SET NULL,
  installation_date TEXT NOT NULL,
  warranty_start_date TEXT NOT NULL,
  warranty_end_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'VOID')),
  activated_by TEXT NOT NULL,
  activated_by_type TEXT NOT NULL CHECK (activated_by_type IN ('INTERNAL', 'DEALER')),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  voided_at TIMESTAMPTZ,
  voided_by TEXT,
  void_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_warranties_serial ON warranties(serial_record_id);
CREATE INDEX IF NOT EXISTS idx_warranties_product ON warranties(product_id);
CREATE INDEX IF NOT EXISTS idx_warranties_dealer ON warranties(dealer_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON warranties(warranty_end_date);

-- Mark all migrations as applied in _migrations
INSERT INTO _migrations (name) VALUES
  ('0001_initial_auth_schema'),
  ('0002_products_and_inventory'),
  ('0003_serial_number_inventory'),
  ('0004_dealers_distributors'),
  ('0005_dealer_portal'),
  ('0006_dealer_requests_created_by'),
  ('0007_contact_enquiries'),
  ('0008_contact_enquiries_management'),
  ('0009_contact_enquiries_status_constraint'),
  ('0010_warranties_and_policies')
ON CONFLICT (name) DO NOTHING;
