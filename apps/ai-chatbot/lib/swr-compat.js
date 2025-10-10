/**
 * SWR Compatibility Wrapper
 *
 * This wrapper re-exports SWR's default export to ensure compatibility
 * with @ai-sdk/react which expects `import useSWR from 'swr'`.
 *
 * This file is aliased in next.config.ts to intercept SWR imports.
 */

// Re-export default and all named exports
export {
  SWRConfig,
  default,
  mutate,
  preload,
  unstable_serialize,
  default as useSWR,
  useSWRConfig,
} from 'swr';
