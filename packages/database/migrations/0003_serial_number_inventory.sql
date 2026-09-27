-- Migration: 0003_serial_number_inventory
-- PostgreSQL / Supabase migration for Serial Number Inventory model

-- 1. Create serial_numbers table
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

-- 2. Create serial_movements table (immutable ledger)
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

-- 3. Cleanup obsolete retail tables if present
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;

INSERT INTO _migrations (name) VALUES ('0003_serial_number_inventory')
ON CONFLICT (name) DO NOTHING;
