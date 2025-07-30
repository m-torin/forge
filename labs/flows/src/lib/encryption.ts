// encryption.ts
'use server';

import { logError } from '@repo/observability';

// Import necessary types from TypeScript
type CryptoKey = globalThis.CryptoKey;

/**
 * Interface representing the structure of encrypted data.
 */
interface EncryptedData {
  salt: string;
  iv: string;
  ciphertext: string;
}

/**
 * Configuration settings for AES-256-GCM encryption.
 */
const CONFIG = {
  ALGORITHM_NAME: 'AES-GCM',
  KEY_LENGTH: 256, // in bits
  IV_LENGTH: 12, // 12 bytes for GCM
  PBKDF2_ITERATIONS: 100000,
  PBKDF2_HASH: 'SHA-256' as const,
  DERIVED_KEY_LENGTH: 256, // in bits
};

// Access the Web Crypto API (available in both browser and Node.js 20)
const cryptoObj = globalThis.crypto?.subtle;

if (!cryptoObj) {
  throw new Error('Web Crypto API is not available in this environment.');
}

// Helper Functions

/**
 * Converts a string to a Uint8Array using UTF-8 encoding.
 * @param {string} str - The input string.
 * @returns {Uint8Array} - Uint8Array representation of the string.
 */
const stringToUint8Array = (str: string): Uint8Array =>
  new TextEncoder().encode(str);

/**
 * Converts an ArrayBuffer or Uint8Array to a hexadecimal string.
 * @param {ArrayBuffer | Uint8Array} buffer - The input buffer.
 * @returns {string} - Hexadecimal string representation.
 */
const bufferToHex = (buffer: ArrayBuffer | Uint8Array): string => {
  const byteArray =
    buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Converts a hexadecimal string to a Uint8Array.
 * @param {string} hex - The hexadecimal string.
 * @returns {Uint8Array} - Uint8Array representation.
 * @throws Will throw an error if the hex string is invalid.
 */
const hexToUint8Array = (hex: string): Uint8Array => {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
  const byteArray = new Uint8Array(hex.length / 2);
  for (let i = 0; i < byteArray.length; i++) {
    const byte = hex.slice(i * 2, i * 2 + 2);
    const parsed = Number.parseInt(byte, 16);
    if (isNaN(parsed)) throw new Error('Invalid hex character');
    byteArray[i] = parsed;
  }
  return byteArray;
};

/**
 * Derives a CryptoKey using PBKDF2 from a given secret and salt.
 * @param {string} secret - The secret string.
 * @param {Uint8Array} salt - The salt as a Uint8Array.
 * @returns {Promise<CryptoKey>} - A Promise that resolves to a CryptoKey.
 */
const deriveKey = async (
  secret: string,
  salt: Uint8Array,
): Promise<CryptoKey> => {
  const keyMaterial = await cryptoObj.importKey(
    'raw',
    stringToUint8Array(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  return await cryptoObj.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: CONFIG.PBKDF2_ITERATIONS,
      hash: CONFIG.PBKDF2_HASH,
    },
    keyMaterial,
    { name: CONFIG.ALGORITHM_NAME, length: CONFIG.DERIVED_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
};

/**
 * Retrieves the encryption secret from environment variables securely.
 * @returns {string} - The encryption secret string.
 * @throws Will throw an error if ENCRYPTION_SECRET is not set.
 */
const getEncryptionSecret = (): string => {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error(
      'ENCRYPTION_SECRET is not set in the environment variables.',
    );
  }
  return secret;
};

/**
 * Generates a secure random IV.
 * @returns {Uint8Array} - Uint8Array representing the IV.
 */
const generateIV = (): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(CONFIG.IV_LENGTH));

/**
 * Generates a secure random salt.
 * @returns {Uint8Array} - Uint8Array representing the salt.
 */
const generateSalt = (): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(16)); // 128-bit salt

/**
 * Encrypts a given text using AES-256-GCM.
 */
export const encrypt = async (text: string): Promise<string> => {
  try {
    const secret = getEncryptionSecret();
    const salt = generateSalt();
    const key = await deriveKey(secret, salt);
    const iv = generateIV();

    const encryptedBuffer = await cryptoObj.encrypt(
      { name: CONFIG.ALGORITHM_NAME, iv },
      key,
      stringToUint8Array(text),
    );

    // Format: "salt:iv:encryptedData"
    return `${bufferToHex(salt)}:${bufferToHex(iv)}:${bufferToHex(encryptedBuffer)}`;
  } catch (error) {
    logError('Encryption failed', { error });
    throw new Error('Encryption unsuccessful.');
  }
};

/**
 * Parses and validates the encrypted data format.
 * @param {string} data - The encrypted data string.
 * @returns {EncryptedData} - An object containing salt, iv, and ciphertext.
 * @throws Will throw an error if data format is invalid.
 */
const parseEncryptedData = (data: string): EncryptedData => {
  const parts = data.split(':');
  if (parts.length !== 3) {
    throw new Error(
      'Invalid encrypted data format. Expected "salt:iv:encryptedData".',
    );
  }

  const [salt, iv, ciphertext] = parts;
  const hexRegex = /^[0-9a-f]+$/i;

  if (
    !hexRegex.test(salt) ||
    !hexRegex.test(iv) ||
    !hexRegex.test(ciphertext)
  ) {
    throw new Error('Encrypted data contains invalid hexadecimal characters.');
  }

  return { salt, iv, ciphertext };
};

/**
 * Decrypts a given encrypted text using AES-256-GCM.
 * @param {string} data - The encrypted data in the format "salt:iv:encryptedData" (hexadecimal).
 * @returns {Promise<string>} - A Promise that resolves to the decrypted plaintext.
 * @throws Will throw an error if decryption fails or data format is invalid.
 */
export const decrypt = async (data: string): Promise<string> => {
  try {
    const { salt, iv, ciphertext } = parseEncryptedData(data);
    const secret = getEncryptionSecret();
    const saltBytes = hexToUint8Array(salt);
    const ivBytes = hexToUint8Array(iv);
    const encryptedBytes = hexToUint8Array(ciphertext);

    const key = await deriveKey(secret, saltBytes);

    const decryptedBuffer = await cryptoObj.decrypt(
      { name: CONFIG.ALGORITHM_NAME, iv: ivBytes },
      key,
      encryptedBytes,
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    logError('Decryption failed', { error });
    throw new Error('Decryption unsuccessful.');
  }
};
