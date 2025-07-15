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
 *     personalApiKey: env.POSTHOG_PERSONAL_API_KEY,
 *     projectId: env.POSTHOG_PROJECT_ID
 *   });
 * });
 * ```
 */

// Re-export everything from generic server
export * from './server';

// Modern adapter exports
export {
  createAdapterChain,
  createPostHogPayloadAdapter,
  createPostHogVariantAdapter,
  modernEdgeConfigAdapter as edgeConfigAdapter,
  modernPostHogAdapter as postHogServerAdapter,
  validateAdapterConfig,
} from './adapters/provider-adapters';

// Next.js specific - Vercel Flags SDK functions
export {
  dedupe,
  deserialize,
  evaluate,
  flag,
  generatePermutations,
  getPrecomputed,
  serialize,
} from './shared/flag';

// Next.js specific - additional exports
export {
  createModernFlagsDiscoveryEndpoint,
  getProviderDataWithMetadata,
  mergeMultipleProviders,
} from './server/discovery';
export * from './server/flags';

// Analytics integration
export {
  analyticsConfig,
  track,
  trackBatch,
  trackConversion,
  trackExperiment,
  trackExperimentAssignment,
  trackFlagConversion,
  trackFlagEvaluation,
  trackFlagEvaluationsBatch,
} from './server/analytics';

// Modern exports from flags/next package
export { createFlagsDiscoveryEndpoint, getProviderData, precompute } from 'flags/next';

// Modern exports from flags package
export { decryptFlagValues, encryptFlagValues, verifyAccess, version } from 'flags';

// Shared types
export type * from './shared/types';
