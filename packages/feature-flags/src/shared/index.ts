export * from './context-extraction';
export * from './createVercelFlag';
export * from './encryption';
export * from './flag';
export * from './types';

// Modern v4 utilities
export { identify, type FlagContext } from './identify';
// Modern encryption functions are now available from './encryption'

// Export patterns (with specific names to avoid conflicts)
export {
  createBooleanFlag as modernCreateBooleanFlag,
  createRolloutFlag as modernCreateRolloutFlag,
  createVariantFlag as modernCreateVariantFlag,
} from '../patterns';

// Export testing utilities
export * from '../testing';

// Export precomputation utilities
export * from '../server/precomputation';
