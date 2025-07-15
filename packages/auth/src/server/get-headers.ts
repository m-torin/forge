/**
 * Helper to get headers for server actions
 */

import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';

/**
 * Get headers object for auth API calls
 * Used in server actions where headers are required
 */
export async function getAuthHeaders(): Promise<ReadonlyHeaders> {
  return await headers();
}
