/**
 * Modern Feature Flags built on Vercel Flags SDK v4
 *
 * Core SDK re-exports with v4 compatibility
 */

// Essential v4 SDK exports (confirmed available)
export {
  createFlagsDiscoveryEndpoint,
  dedupe,
  deserialize,
  evaluate,
  flag,
  generatePermutations,
  getPrecomputed,
  getProviderData,
  precompute,
  serialize,
} from 'flags/next';

// Base SDK encryption utilities (confirmed available)
export {
  decryptFlagValues,
  encryptFlagValues,
  mergeProviderData,
  reportValue,
  verifyAccess,
  version,
} from 'flags';

// Alias precompute functions for v4 compatibility
export {
  evaluate as unstable_evaluate,
  precompute as unstable_precompute,
  serialize as unstable_serialize,
} from 'flags/next';

// Keep existing advanced features for backward compatibility
export { decodePermutation } from './core-functions';

export {
  decryptFlagDefinitions,
  decryptOverrides,
  encryptFlagDefinitions,
  encryptOverrides,
  generateFlagsSecret,
  isEncryptionAvailable,
  validateFlagsSecret,
} from './encryption';

export {
  getAnalyticsStatus,
  resetAnalyticsConfig,
  trackFlagExposure,
  unstable_getFlagsProps,
  unstable_setGlobalFlagsAnalyticsKeys,
} from './vercel-analytics';

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

export type {
  ExperimentAssignmentCallback,
  ExperimentAssignmentEvent,
  ExperimentConversionCallback,
  ExperimentConversionEvent,
  ExperimentExposureCallback,
  ExperimentExposureEvent,
} from './vercel-analytics';

export {
  clearDomFlagStates,
  configureDomIntegration,
  generateFlagBasedCSS,
  getCurrentDomFlagStates,
  updateDomWithFlagStates,
  watchFlagStateChanges,
} from './dom-integration';
