/**
 * Node.js runtime optimized exports
 * Designed for traditional Node.js server environments
 *
 * This entry point provides full functionality including all adapters
 * and features that work in Node.js environments.
 */

// Node.js optimized client factory
export {
  closeClient,
  createDevelopmentClient,
  createMonitoredClient,
  createNodeClient,
  createPostgreSQLClient,
  createProductionClient,
  createSQLiteClient,
  getClient,
  getDefaultClientSync,
  validateNodeClientOptions,
  type NodeClientOptions,
} from './client';

// Export extended client types
export type { ExtendedClient, ExtendedPrismaClient } from '../extensions/index';

// Runtime detection
export {
  detectRuntime,
  getSupportedAdapters,
  isAdapterSupported,
  validateAdapterEnvironment,
  type RuntimeEnvironment,
} from '../runtime/detector';

// Auto-adapter selection
export {
  autoSelectAdapter,
  createOptimizedClient,
  type AdapterConfig,
  type ClientOptions,
} from '../runtime/selector';

// All adapter factories (Node.js supports them all)
export { createD1Adapter, type D1AdapterOptions } from '../adapters/d1';
export { createNeonAdapter, type NeonAdapterOptions } from '../adapters/neon';
export { createPlanetScaleAdapter, type PlanetScaleAdapterOptions } from '../adapters/planetscale';
export { createPostgreSQLAdapter, type PostgreSQLAdapterOptions } from '../adapters/postgresql';
export { createSQLiteAdapter, type SQLiteAdapterOptions } from '../adapters/sqlite';
export { createTursoAdapter, type TursoAdapterOptions } from '../adapters/turso';

// Configuration and utilities
export { EnvironmentConfig, PrismaAdapterConfig, createAdapterConfig } from '../config';
export {
  checkDependency,
  createConnectionString,
  createPrismaClientWithAdapter,
  createQuickAdapter,
  devHelpers,
  envHelpers,
  getInstallCommand,
  getOptimalProvider,
  parseConnectionString,
} from '../utils';

// Essential types
export type {
  AdapterOptions,
  ClientOptions as BaseClientOptions,
  D1AdapterOptions as D1Options,
  DatabaseProvider,
  PostgreSQLAdapterOptions as PostgreSQLOptions,
  PrismaAdapterInstance,
  RuntimeConfig,
  SQLiteAdapterOptions as SQLiteOptions,
} from '../types';
