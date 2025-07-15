// Modern encryption imports from flags package
import { logError, logInfo, logWarn } from '@repo/observability';
import { safeEnv } from '../../env';

// Lazy-loaded encryption function
let encryptFunc: typeof import('flags').encryptFlagValues | undefined;
let encryptFuncPromise: Promise<typeof import('flags').encryptFlagValues | undefined> | undefined;

// Lazy initialization of encryption function
async function getEncryptFunction() {
  if (encryptFunc !== undefined) {
    return encryptFunc;
  }

  if (!encryptFuncPromise) {
    encryptFuncPromise = (async () => {
      try {
        const flags = await import('flags');
        encryptFunc = flags.encryptFlagValues;
        return encryptFunc;
      } catch (_error) {
        // Encryption functions not available, will use manual implementations
        encryptFunc = undefined;
        return undefined;
      }
    })();
  }

  return await encryptFuncPromise;
}

/**
 * Encrypt flag values using available encryption method
 */
export async function encryptFlags(values: Record<string, any>): Promise<string> {
  const env = safeEnv();
  const secret = env.FLAGS_SECRET;

  if (!secret) {
    logWarn('FLAGS_SECRET not configured - flag values will not be encrypted', {
      context: 'encryption',
    });
    throw new Error('FLAGS_SECRET is required for flag encryption');
  }

  try {
    const encryptFunction = await getEncryptFunction();
    if (encryptFunction) {
      return await encryptFunction(values, secret);
    } else if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Use Web Crypto API for encryption
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(values));
      const keyMaterial = encoder.encode(secret);

      // Import the secret as a key
      const key = await crypto.subtle.importKey(
        'raw',
        keyMaterial.slice(0, 32), // Ensure 32 bytes for AES-256
        { name: 'AES-GCM' },
        false,
        ['encrypt'],
      );

      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Return as base64
      return btoa(String.fromCharCode(...combined));
    } else {
      // Fallback: Simple base64 encoding (not secure, for development only)
      logWarn('Real encryption not available, using base64 fallback (development only)', {
        context: 'encryption-fallback',
      });
      return Buffer.from(JSON.stringify(values)).toString('base64');
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to encrypt flag values'), {
      context: 'encryption',
    });
    throw error;
  }
}

/**
 * Note: In the modern flags package, decryption is handled internally by the SDK.
 * Flag values are automatically decrypted when accessed through the flag() function.
 * This function is kept for backward compatibility but logs a deprecation warning.
 */
export async function decryptFlags(encryptedValues: string): Promise<Record<string, any>> {
  logWarn('decryptFlags is deprecated - modern flags SDK handles decryption internally', {
    context: 'decryption-deprecated',
  });

  const env = safeEnv();
  const secret = env.FLAGS_SECRET;

  try {
    if (secret && typeof crypto !== 'undefined' && crypto.subtle) {
      // Try Web Crypto API decryption first
      const combined = Uint8Array.from(atob(encryptedValues), c => c.charCodeAt(0));
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const keyMaterial = encoder.encode(secret);

      // Import the secret as a key
      const key = await crypto.subtle.importKey(
        'raw',
        keyMaterial.slice(0, 32),
        { name: 'AES-GCM' },
        false,
        ['decrypt'],
      );

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);

      const decryptedText = decoder.decode(decrypted);
      return JSON.parse(decryptedText);
    } else {
      // Fallback: Simple base64 decoding for legacy compatibility
      return JSON.parse(Buffer.from(encryptedValues, 'base64').toString());
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to decode legacy flag values'), {
      context: 'legacy-decryption',
    });
    throw error;
  }
}

/**
 * Encrypt arbitrary data using available encryption method
 */
export async function encryptData(data: any): Promise<string> {
  const env = safeEnv();
  const secret = env.FLAGS_SECRET;

  if (!secret) {
    logWarn('FLAGS_SECRET not configured - data will not be encrypted', {
      context: 'data-encryption',
    });
    throw new Error('FLAGS_SECRET is required for data encryption');
  }

  try {
    if (encryptFunc) {
      return await encryptFunc(data, secret);
    } else if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Use Web Crypto API for encryption
      const encoder = new TextEncoder();
      const dataStr = encoder.encode(JSON.stringify(data));
      const keyMaterial = encoder.encode(secret);

      // Import the secret as a key
      const key = await crypto.subtle.importKey(
        'raw',
        keyMaterial.slice(0, 32), // Ensure 32 bytes for AES-256
        { name: 'AES-GCM' },
        false,
        ['encrypt'],
      );

      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataStr);

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Return as base64
      return btoa(String.fromCharCode(...combined));
    } else {
      // Fallback: Simple base64 encoding (not secure, for development only)
      logWarn('Real encryption not available, using base64 fallback (development only)', {
        context: 'data-encryption-fallback',
      });
      return Buffer.from(JSON.stringify(data)).toString('base64');
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to encrypt data'), {
      context: 'data-encryption',
    });
    throw error;
  }
}

/**
 * Decrypt arbitrary data - fallback implementation for legacy compatibility
 * Note: Modern flags SDK handles encryption/decryption internally
 */
export async function decryptData(encryptedData: string): Promise<any> {
  logWarn('decryptData is deprecated - consider using modern flags SDK patterns', {
    context: 'data-decryption-deprecated',
  });

  const env = safeEnv();
  const secret = env.FLAGS_SECRET;

  try {
    if (secret && typeof crypto !== 'undefined' && crypto.subtle) {
      // Try Web Crypto API decryption first
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const keyMaterial = encoder.encode(secret);

      // Import the secret as a key
      const key = await crypto.subtle.importKey(
        'raw',
        keyMaterial.slice(0, 32),
        { name: 'AES-GCM' },
        false,
        ['decrypt'],
      );

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);

      const decryptedText = decoder.decode(decrypted);
      return JSON.parse(decryptedText);
    } else {
      // Fallback: Simple base64 decoding for legacy compatibility
      return JSON.parse(Buffer.from(encryptedData, 'base64').toString());
    }
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to decode legacy data'), {
      context: 'legacy-data-decryption',
    });
    throw error;
  }
}

/**
 * Check if encryption is available (FLAGS_SECRET is configured)
 */
export function isEncryptionAvailable(): boolean {
  const env = safeEnv();
  return !!(env.FLAGS_SECRET && env.FLAGS_SECRET.length >= 32);
}

/**
 * Get encryption status information for debugging
 */
export function getEncryptionStatus(): {
  available: boolean;
  method: string;
  environment: string;
} {
  const env = safeEnv();
  return {
    available: isEncryptionAvailable(),
    method: isEncryptionAvailable() ? 'aes-256-gcm' : 'none',
    environment: env.NODE_ENV || 'development',
  };
}

/**
 * Generate a secure FLAGS_SECRET for development
 * Note: This should only be used in development - production secrets should be managed securely
 */
export async function generateFlagsSecret(): Promise<string> {
  try {
    // Try Node.js crypto first
    const nodeCrypto = await import('node:crypto');
    if (nodeCrypto && nodeCrypto.randomBytes) {
      return nodeCrypto.randomBytes(32).toString('base64url');
    }
  } catch (_error) {
    // Node.js crypto not available, try Web Crypto API
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Web Crypto API available - we could implement encryption here
      // For now, we'll fall back to the manual implementation below
    }
  }

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser environment
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } else {
    throw new Error('Crypto API not available for secret generation');
  }
}

/**
 * Validate FLAGS_SECRET format
 */
export function validateFlagsSecret(secret: string): { valid: boolean; reason?: string } {
  if (!secret) {
    return { valid: false, reason: 'Secret is empty' };
  }

  if (secret.length < 32) {
    return { valid: false, reason: 'Secret must be at least 32 characters' };
  }

  // Check if it's base64url encoded (recommended format)
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  if (!base64urlPattern.test(secret)) {
    return {
      valid: false,
      reason: 'Secret should be base64url encoded (A-Za-z0-9_- characters only)',
    };
  }

  return { valid: true };
}

/**
 * Safe encryption wrapper that handles missing secrets gracefully
 */
export async function safeEncryptFlags(
  values: Record<string, any>,
  options: {
    fallbackToPlaintext?: boolean;
    warnOnMissingSecret?: boolean;
  } = {},
): Promise<{ encrypted: string | null; plaintext: Record<string, any> | null }> {
  const { fallbackToPlaintext = false, warnOnMissingSecret = true } = options;

  if (!isEncryptionAvailable()) {
    if (warnOnMissingSecret) {
      logWarn('FLAGS_SECRET not available - encryption skipped', {
        context: 'safe-encryption',
        fallbackEnabled: fallbackToPlaintext,
      });
    }

    return {
      encrypted: null,
      plaintext: fallbackToPlaintext ? values : null,
    };
  }

  try {
    const encrypted = await encryptFlags(values);
    return { encrypted, plaintext: null };
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Safe encryption failed'), {
      context: 'safe-encryption',
    });

    if (fallbackToPlaintext) {
      return { encrypted: null, plaintext: values };
    }

    throw error;
  }
}

/**
 * v4 Breaking Change: Advanced Encryption Functions
 * These replace the unified encrypt/decrypt functions from earlier versions
 */

/**
 * Encrypt flag definitions with specific format for v4 compliance
 * @param definitions - Flag definitions object to encrypt
 * @param secret - Optional secret override
 * @returns Encrypted flag definitions string
 */
export async function encryptFlagDefinitions(
  definitions: Record<string, any>,
  secret?: string,
): Promise<string> {
  const env = safeEnv();
  const encryptionSecret = secret || env.FLAGS_SECRET;

  if (!encryptionSecret) {
    throw new Error('FLAGS_SECRET is required for flag definition encryption');
  }

  try {
    // Add metadata for v4 compliance
    const definitionsWithMeta = {
      ...definitions,
      __meta: {
        type: 'flag-definitions',
        version: '4.0.1',
        encrypted: true,
        timestamp: new Date().toISOString(),
      },
    };

    return await encryptWithSecret(definitionsWithMeta, encryptionSecret);
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to encrypt flag definitions'), {
      context: 'encrypt-flag-definitions',
    });
    throw error;
  }
}

/**
 * Decrypt flag definitions encrypted with encryptFlagDefinitions
 * @param encryptedDefinitions - Encrypted definitions string
 * @param secret - Optional secret override
 * @returns Decrypted flag definitions object
 */
export async function decryptFlagDefinitions(
  encryptedDefinitions: string,
  secret?: string,
): Promise<Record<string, any>> {
  const env = safeEnv();
  const encryptionSecret = secret || env.FLAGS_SECRET;

  if (!encryptionSecret) {
    throw new Error('FLAGS_SECRET is required for flag definition decryption');
  }

  try {
    const decrypted = await decryptWithSecret(encryptedDefinitions, encryptionSecret);

    // Validate v4 format
    if (typeof decrypted === 'object' && decrypted.__meta?.type === 'flag-definitions') {
      const { meta, ...definitions } = decrypted;
      logInfo('Decrypted flag definitions', {
        version: meta.version,
        definitionCount: Object.keys(definitions).length,
        encrypted: meta.encrypted,
      });
      return definitions;
    }

    // Fallback for legacy format
    return decrypted;
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to decrypt flag definitions'), {
      context: 'decrypt-flag-definitions',
    });
    throw error;
  }
}

/**
 * Encrypt flag overrides with specific format for v4 compliance
 * @param overrides - Flag overrides object to encrypt
 * @param secret - Optional secret override
 * @returns Encrypted flag overrides string
 */
export async function encryptOverrides(
  overrides: Record<string, any>,
  secret?: string,
): Promise<string> {
  const env = safeEnv();
  const encryptionSecret = secret || env.FLAGS_SECRET;

  if (!encryptionSecret) {
    throw new Error('FLAGS_SECRET is required for override encryption');
  }

  try {
    // Add metadata for v4 compliance
    const overridesWithMeta = {
      ...overrides,
      __meta: {
        type: 'flag-overrides',
        version: '4.0.1',
        encrypted: true,
        timestamp: new Date().toISOString(),
      },
    };

    return await encryptWithSecret(overridesWithMeta, encryptionSecret);
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to encrypt flag overrides'), {
      context: 'encrypt-overrides',
    });
    throw error;
  }
}

/**
 * Decrypt flag overrides encrypted with encryptOverrides
 * @param encryptedOverrides - Encrypted overrides string
 * @param secret - Optional secret override
 * @returns Decrypted flag overrides object
 */
export async function decryptOverrides(
  encryptedOverrides: string,
  secret?: string,
): Promise<Record<string, any>> {
  const env = safeEnv();
  const encryptionSecret = secret || env.FLAGS_SECRET;

  if (!encryptionSecret) {
    throw new Error('FLAGS_SECRET is required for override decryption');
  }

  try {
    const decrypted = await decryptWithSecret(encryptedOverrides, encryptionSecret);

    // Validate v4 format
    if (typeof decrypted === 'object' && decrypted.__meta?.type === 'flag-overrides') {
      const { meta, ...overrides } = decrypted;
      logInfo('Decrypted flag overrides', {
        version: meta.version,
        overrideCount: Object.keys(overrides).length,
        encrypted: meta.encrypted,
      });
      return overrides;
    }

    // Fallback for legacy format
    return decrypted;
  } catch (error) {
    logError(error instanceof Error ? error : new Error('Failed to decrypt flag overrides'), {
      context: 'decrypt-overrides',
    });
    throw error;
  }
}

/**
 * Unified encryption helper using Web Crypto API
 * Handles both modern and fallback encryption
 */
async function encryptWithSecret(data: any, secret: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Web Crypto API implementation
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(JSON.stringify(data));
    const keyMaterial = encoder.encode(secret);

    // Import the secret as a key
    const key = await crypto.subtle.importKey(
      'raw',
      keyMaterial.slice(0, 32), // Ensure 32 bytes for AES-256
      { name: 'AES-GCM' },
      false,
      ['encrypt'],
    );

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataBytes);

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return as base64url for v4 compatibility
    return btoa(String.fromCharCode(...combined))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } else {
    // Fallback implementation
    logWarn('Web Crypto API not available, using fallback encryption');
    return Buffer.from(JSON.stringify(data)).toString('base64url');
  }
}

/**
 * Unified decryption helper using Web Crypto API
 * Handles both modern and fallback decryption
 */
async function decryptWithSecret(encryptedData: string, secret: string): Promise<any> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      // Convert base64url back to base64 for atob
      const base64 = encryptedData
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(encryptedData.length + ((4 - (encryptedData.length % 4)) % 4), '=');

      const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const keyMaterial = encoder.encode(secret);

      // Import the secret as a key
      const key = await crypto.subtle.importKey(
        'raw',
        keyMaterial.slice(0, 32),
        { name: 'AES-GCM' },
        false,
        ['decrypt'],
      );

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);

      const decryptedText = decoder.decode(decrypted);
      return JSON.parse(decryptedText);
    } catch (_error) {
      // If Web Crypto fails, try fallback
      logWarn('Web Crypto decryption failed, trying fallback');
    }
  }

  // Fallback implementation
  try {
    return JSON.parse(Buffer.from(encryptedData, 'base64url').toString());
  } catch (error) {
    throw new Error(`Failed to decrypt data: ${error}`);
  }
}
