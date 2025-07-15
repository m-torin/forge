/**
 * Server-side Next.js feature flags exports
 * Complete Next.js 15 integration for server components, API routes, and middleware
 *
 * @example
 * ```typescript
 * import { flag, getPostHogProviderData, createFlagsDiscoveryEndpoint } from '@repo/feature-flags/server/next';
 *
 * // Define a flag
 * export const myFlag = flag({
 *   key: 'my-feature',
 *   decide: () => true,
 *   defaultValue: false
 * });
 *
 * // Discovery endpoint
 * export const GET = createFlagsDiscoveryEndpoint(async () => {
 *   return getPostHogProviderData({
 *     personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
 *     projectId: process.env.POSTHOG_PROJECT_ID
 *   });
 * });
 * ```
 */

// Re-export everything from generic server
export * from './server';

// Next.js specific - Vercel Flags SDK functions
export {
  dedupe,
  deserialize,
  evaluate,
  flag,
  generatePermutations,
  getPrecomputed,
  precompute,
  serialize,
} from './shared/flag';

// Next.js specific - additional exports
export { createFlagsDiscoveryEndpoint } from './discovery';
export * from './server/flags';
// export { verifyAccess } from '@vercel/flags/next';

// Next.js specific types
export type { ReadonlyHeaders, ReadonlyRequestCookies } from '@vercel/flags';

// Shared types
export type * from './shared/types';
