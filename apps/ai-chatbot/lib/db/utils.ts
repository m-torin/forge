import { generateId } from 'ai';
import { genSaltSync, hashSync } from 'bcrypt-ts';

/**
 * Generates a hashed password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export function generateHashedPassword(password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}

/**
 * Generates a dummy hashed password for security purposes
 * @returns Hashed dummy password
 */
export function generateDummyPassword() {
  const password = generateId();
  const hashedPassword = generateHashedPassword(password);

  return hashedPassword;
}
