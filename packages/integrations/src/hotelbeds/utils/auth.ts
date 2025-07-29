import CryptoJS from 'crypto-js';

/**
 * Generate signature for Hotelbeds API authentication
 * @param apiKey - The API key
 * @param secret - The API secret
 * @param timestamp - Unix timestamp
 * @returns The generated signature
 */
export function generateSignature(apiKey: string, secret: string, timestamp: number): string {
  const signatureString = `${apiKey}${secret}${timestamp}`;
  return CryptoJS.SHA256(signatureString).toString();
}

/**
 * Generate timestamp for API requests
 * @returns Current Unix timestamp
 */
export function generateTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Validate API credentials
 * @param apiKey - The API key to validate
 * @param secret - The API secret to validate
 * @returns True if credentials are valid
 */
export function validateCredentials(apiKey: string, secret: string): boolean {
  return !!(apiKey && secret && apiKey.length > 0 && secret.length > 0);
}
