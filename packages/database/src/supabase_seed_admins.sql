-- ====================================================================
-- TRIONYX ADMIN & MANAGING DIRECTOR USERS SEED SCRIPT
-- Run this in Supabase SQL Editor to create or reset the main portal logins.
-- Password for both accounts is: Admin@Trionyx2026!
-- ====================================================================

INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
VALUES
  (
    '3f8bcc40-9124-4433-880b-96ff19c2e937',
    'Trionyx Administrator',
    'admin@trionyx.com',
    '$argon2id$v=19$m=19456,t=2,p=1$kWPMW1y5qt27Nu1cDnw92Q$JD9BoGo3Pd0A8l4KlQ4wzpvLR53hiE/NZX25o1v+SSM',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    '5e2cb83a-4411-477c-a494-82a13cc7c1b1',
    'Sai Managing Director',
    'sai@trionyx.com',
    '$argon2id$v=19$m=19456,t=2,p=1$kWPMW1y5qt27Nu1cDnw92Q$JD9BoGo3Pd0A8l4KlQ4wzpvLR53hiE/NZX25o1v+SSM',
    'MANAGING_DIRECTOR',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = 'ACTIVE',
  failed_login_count = 0,
  locked_until = NULL,
  updated_at = CURRENT_TIMESTAMP;
