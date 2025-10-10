/**
 * Runtime detection and adapter selection utilities
 * Tree-shakeable exports for edge and node environments
 */

// Runtime detection
export {
  detectRuntime,
  getSupportedAdapters,
  isAdapterSupported,
  validateAdapterEnvironment,
  type RuntimeEnvironment,
} from './detector';

// Adapter auto-selection
export {
  autoSelectAdapter,
  createOptimizedClient,
  type AdapterConfig,
  type ClientOptions,
} from './selector';
