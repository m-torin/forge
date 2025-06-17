/**
 * Helper to get headers for server actions
 */

import { headers } from 'next/headers';

/**
 * Get headers object for auth API calls
 * Used in server actions where headers are required
 */
export async function getAuthHeaders() {
  return await headers();
}
