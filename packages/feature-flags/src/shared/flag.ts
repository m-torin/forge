// Re-export everything from flags/next (modern SDK)
export {
  createFlagsDiscoveryEndpoint,
  dedupe,
  deserialize,
  evaluate,
  flag,
  getPrecomputed,
  getProviderData,
  precompute,
  serialize,
} from 'flags/next';

// Additional modern exports from base flags package
export { decryptFlagValues, encryptFlagValues, verifyAccess, version } from 'flags';

// Core v4 functions (missing from flags package - our implementation)
export {
  decodePermutation,
  generatePermutations,
  mergeProviderData,
  reportValue,
} from './core-functions';

// Advanced encryption functions for v4 breaking changes
export {
  decryptFlagDefinitions,
  decryptOverrides,
  encryptFlagDefinitions,
  encryptOverrides,
  generateFlagsSecret,
  isEncryptionAvailable,
  validateFlagsSecret,
} from './encryption';

// Vercel Analytics integration functions
export {
  getAnalyticsStatus,
  resetAnalyticsConfig,
  trackFlagExposure,
  unstable_getFlagsProps,
  unstable_setGlobalFlagsAnalyticsKeys,
} from './vercel-analytics';

// Advanced experiment tracking
export {
  clearExperimentCallbacks,
  getExperimentTrackingStatus,
  onExperimentAssignment,
  onExperimentConversion,
  onExperimentExposure,
  trackExperimentAssignment,
  trackExperimentConversion,
  trackExperimentEventsBatch,
  trackExperimentExposure,
  trackFlagExposureWithExperiment,
} from './vercel-analytics';

// Experiment tracking types
export type {
  ExperimentAssignmentCallback,
  ExperimentAssignmentEvent,
  ExperimentConversionCallback,
  ExperimentConversionEvent,
  ExperimentExposureCallback,
  ExperimentExposureEvent,
} from './vercel-analytics';

// DOM integration functions (data-variant-state attributes)
export {
  clearDomFlagStates,
  configureDomIntegration,
  generateFlagBasedCSS,
  getCurrentDomFlagStates,
  updateDomWithFlagStates,
  watchFlagStateChanges,
} from './dom-integration';
