import { hash, verify } from '@node-rs/argon2';
import crypto from 'crypto';

/**
 * Hashes a password using RFC 9106 Argon2id.
 * Directives: Never store plaintext passwords; password verification happens only on the server.
 */
export async function hashPassword(password: string): Promise<string> {
  // algorithm 2 = Argon2id in RFC 9106 / @node-rs/argon2
  return hash(password, {
    algorithm: 2,
    memoryCost: 19456, // 19 MB (RFC recommended baseline for interactive logins)
    timeCost: 2,       // 2 iterations
    parallelism: 1,
  });
}

/**
 * Verifies a candidate password against an Argon2id hash string in constant time.
 */
export async function verifyPassword(password: string, hashStr: string): Promise<boolean> {
  if (!password || !hashStr) return false;
  try {
    return await verify(hashStr, password);
  } catch {
    return false;
  }
}

/**
 * Generates an opaque cryptographically secure 32-byte session token (hex encoded).
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a SHA-256 hash of a session token for secure server-side storage.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
