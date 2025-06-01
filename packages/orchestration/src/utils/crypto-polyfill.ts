/**
 * Crypto polyfill for browser compatibility
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Simple hash function for browser
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Browser-compatible UUID v4 generator
function browserRandomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const cryptoPolyfill = {
  createHash(algorithm: string) {
    if (isBrowser) {
      return {
        update(data: string) {
          return {
            digest(_format: string) {
              return simpleHash(data);
            },
          };
        },
      };
    }
    // Server-side: use native crypto
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.createHash(algorithm);
  },

  randomUUID(): string {
    if (isBrowser) {
      return browserRandomUUID();
    }
    // Server-side: use native crypto
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.randomUUID();
  },
};
