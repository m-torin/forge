/**
 * MCP Utils TypeScript Main Export
 * Provides centralized utilities for Claude Code agents
 */

// Re-export utility functions for TypeScript consumption
export { loadConfig } from './config';
export { createEntityName, formatAgentResponse, validateAgentRequest } from './utils/agent-helpers';
export { SafeStringifier, safeStringify, safeStringifyAdvanced } from './utils/stringify';

// Export types for better TypeScript support
export type {
  AgentRequest,
  AgentResponse,
  EntityType,
  ValidationResult,
} from './utils/agent-helpers';

export type { LoadConfigOverrides, McpServerConfig } from './config';
export type { SafeStringifyOptions, SafeStringifyResult } from './utils/stringify';

// Export tools for MCP server usage
export * from './tools';

// Re-export utility registries
export { BoundedCache, CacheRegistry, globalCacheRegistry } from './utils/cache';
export { AsyncLogger, LoggerRegistry, globalLoggerRegistry } from './utils/logger';

// Export utility types
export type { BoundedCacheOptions, CacheAnalytics, CacheState, CleanupResult } from './utils/cache';
export type { LogLevel, LoggerOptions, LoggerStats } from './utils/logger';
