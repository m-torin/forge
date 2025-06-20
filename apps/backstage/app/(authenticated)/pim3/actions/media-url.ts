'use server';

// @ts-expect-error - TypeScript can't resolve the path but it exists
import { getMediaUrlAction } from '@repo/storage/server/next';

/**
 * Server action wrapper for getting signed media URLs
 * This allows client components to call the storage server action
 * while maintaining proper client/server boundaries
 */
export async function getSignedMediaUrl(
  storageKey: string,
  options?: {
    context?: 'product' | 'user' | 'admin' | 'public';
    expiresIn?: number;
  },
) {
  return getMediaUrlAction(storageKey, options);
}
