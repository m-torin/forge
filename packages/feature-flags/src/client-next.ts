/**
 * Client-side Next.js feature flags exports
 * Complete Next.js 15 integration for client components and browser environments
 *
 * @example
 * ```typescript
 * import { useFlag, postHogClientAdapter } from '@repo/feature-flags/client/next';
 *
 * // In a client component
 * export function MyComponent() {
 *   const showFeature = useFlag(myFlag, false);
 *   return showFeature ? <Feature /> : null;
 * }
 * ```
 */

// Re-export everything from generic client
export * from './client';

// Next.js specific client exports
export { useFlag } from './client/hooks';

// Re-export client utilities from shared
export { dedupe } from './shared/flag';
