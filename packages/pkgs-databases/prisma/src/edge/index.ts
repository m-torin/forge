/**
 * Edge runtime optimized exports
 * Designed for Vercel Edge Functions, Cloudflare Workers, and other edge environments
 *
 * This entry point provides only the essential functionality needed for edge runtimes,
 * ensuring minimal bundle size and optimal performance.
 */

// Edge-optimized client factory
export {
  createCloudflareClient,
  createEdgeClient,
  createPooledEdgeClient,
  createVercelEdgeClient,
  getClient,
  getDefaultEdgeClientSync,
  validateEdgeClientOptions,
  type EdgeClientOptions,
} from './client';

// Connection pooling for edge environments
export {
  createPooledAdapter,
  isVercelFluidAvailable,
  logPoolStats,
  validatePoolingOptions,
  type PoolStats,
  type PoolingAdapter,
  type PoolingOptions,
} from './pooling';

// Runtime detection (essential for edge)
export {
  detectRuntime,
  getSupportedAdapters,
  isAdapterSupported,
  type RuntimeEnvironment,
} from '../runtime/detector';

// Auto-adapter selection
export { autoSelectAdapter, type AdapterConfig, type ClientOptions } from '../runtime/selector';

// Essential adapter factories (tree-shakeable)
export { createD1Adapter, type D1AdapterOptions } from '../adapters/d1';
export { createNeonAdapter, type NeonAdapterOptions } from '../adapters/neon';
export { createPlanetScaleAdapter, type PlanetScaleAdapterOptions } from '../adapters/planetscale';
export { createTursoAdapter, type TursoAdapterOptions } from '../adapters/turso';

// Edge-compatible utilities
export { checkDependency, envHelpers, getOptimalProvider } from '../utils';

// Essential types
export type {
  AdapterOptions,
  ClientOptions as BaseClientOptions,
  DatabaseProvider,
} from '../types';
