import { test, describe } from 'node:test';
import assert from 'node:assert';
import { loginSchema, createInternalUserSchema, normalizeEmail } from '@trionyx/validation';

describe('Validation Layer', () => {
  test('normalizeEmail trims whitespace and converts to lowercase', () => {
    assert.strictEqual(normalizeEmail('  Admin@Trionyx.com  '), 'admin@trionyx.com');
    assert.strictEqual(normalizeEmail('USER@EXAMPLE.COM'), 'user@example.com');
  });

  test('loginSchema accepts valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'Sai@Trionyx.com',
      password: 'SecurePassword123!',
    });
    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data.email, 'sai@trionyx.com');
      assert.strictEqual(result.data.password, 'SecurePassword123!');
    }
  });

  test('loginSchema rejects invalid email formats', () => {
    const invalidEmails = ['invalid', 'missing-at.com', '@nodomain', 'spaces in@email.com'];
    for (const email of invalidEmails) {
      const result = loginSchema.safeParse({ email, password: 'password123' });
      assert.strictEqual(result.success, false, `Expected ${email} to be rejected`);
    }
  });

  test('loginSchema rejects missing or empty password', () => {
    const result = loginSchema.safeParse({
      email: 'valid@trionyx.com',
      password: '',
    });
    assert.strictEqual(result.success, false);
  });

  test('createInternalUserSchema validates role enum and minimum password length', () => {
    const valid = createInternalUserSchema.safeParse({
      name: 'Sai MD',
      email: 'md@trionyx.com',
      role: 'MANAGING_DIRECTOR',
      password: 'password123',
    });
    assert.strictEqual(valid.success, true);

    const invalidRole = createInternalUserSchema.safeParse({
      name: 'Test',
      email: 'test@trionyx.com',
      role: 'CUSTOMER',
      password: 'password123',
    });
    assert.strictEqual(invalidRole.success, false);

    const shortPassword = createInternalUserSchema.safeParse({
      name: 'Test',
      email: 'test@trionyx.com',
      role: 'ADMIN',
      password: 'short',
    });
    assert.strictEqual(shortPassword.success, false);
  });
});
