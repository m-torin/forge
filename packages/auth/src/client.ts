/**
 * Client exports for browser environments (non-Next.js)
 */

'use client';

// Export configured client
export { authClient } from './client/client.config';

// Export hooks
export { useSession } from './client/hooks';

// Export types
export type * from './types';

// Export client utilities
export { signIn, signUp, signOut, getSession } from './client/methods';
