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

// React hooks for client-side flag evaluation
export {
  clearFlagCache,
  setClientFlagValues,
  useFlag,
  useFlagValue,
  useFlags,
} from './client/react';

// React components for flag display and conditional rendering
export { ConditionalFlag, FlagProvider, FlagValues } from './client/react-components';

// Note: Server-side utilities like dedupe should not be imported in client components
// Use server components to evaluate flags and pass results as props
