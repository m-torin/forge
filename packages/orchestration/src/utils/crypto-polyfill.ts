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

// Lazy load crypto module for server-side
let serverCrypto: typeof import('crypto') | null = null;

async function getServerCrypto() {
  if (!isBrowser && !serverCrypto) {
    serverCrypto = await import('crypto');
  }
  return serverCrypto;
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
    // Server-side: use native crypto (synchronous fallback for compatibility)
    // Note: This is a temporary solution until async createHash is supported
    try {
      // Dynamic import with fallback for environments that don't support top-level await
      const crypto = (globalThis as any).crypto || (globalThis as any).require?.('crypto');
      if (crypto && typeof crypto.createHash === 'function') {
        return crypto.createHash(algorithm);
      }
    } catch {
      // Fallback to simple hash
    }
    
    // Fallback implementation
    return {
      update(data: string) {
        return {
          digest(_format: string) {
            return simpleHash(data);
          },
        };
      },
    };
  },

  randomUUID(): string {
    if (isBrowser) {
      return browserRandomUUID();
    }
    // Server-side: use native crypto
    try {
      // Check for Web Crypto API first (available in Node 19+)
      if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
      }
      // Fallback for older Node versions
      const crypto = globalThis.crypto || (globalThis as any).require?.('crypto');
      if (crypto?.randomUUID) {
        return crypto.randomUUID();
      }
    } catch {
      // Fallback to browser implementation
    }
    
    return browserRandomUUID();
  },
};
