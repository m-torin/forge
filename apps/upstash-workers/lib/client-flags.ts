/**
 * Client-safe flag definitions
 * These work in client components without server dependencies
 */

/**
 * Simple client-side flag evaluation for QStash mode
 */
export function useLocalQStashClientFlag(): boolean {
  // In client environment, check environment and default to development mode
  if (typeof window !== 'undefined') {
    // Client-side: simple development mode detection
    return process.env.NODE_ENV === 'development';
  }
  
  // Fallback for SSR
  return false;
}

/**
 * Client-safe flag configuration
 */
export const clientFlags = {
  useLocalQStash: useLocalQStashClientFlag,
} as const;