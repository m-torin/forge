import { analyticsTrackingFlag, enhancedSearchFlag, ragEnabledFlag } from './flags';

// Flags suitable for precomputation (not user-specific, stable across requests)
export const precomputeFlags = [
  ragEnabledFlag,
  enhancedSearchFlag,
  analyticsTrackingFlag,
  // Don't include chatModelFlag if it's user-specific
  // Don't include debugModeFlag as it varies by environment
];
