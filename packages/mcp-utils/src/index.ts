/**
 * MCP Utils TypeScript Main Export
 * Provides centralized utilities for Claude Code agents
 */

// Re-export utility functions for TypeScript consumption
export { safeStringify, safeStringifyAdvanced, SafeStringifier } from './utils/stringify';
export { 
  extractObservation, 
  createEntityName, 
  validateAgentRequest, 
  formatAgentResponse 
} from './utils/agent-helpers';

// Export types for better TypeScript support
export type { 
  MCPEntity, 
  EntityType, 
  AgentRequest, 
  AgentResponse, 
  ValidationResult 
} from './utils/agent-helpers';

export type { 
  SafeStringifyOptions, 
  SafeStringifyResult 
} from './utils/stringify';

// Export tools for MCP server usage
export * from './tools';

// Re-export utility registries
export { globalCacheRegistry, BoundedCache, CacheRegistry } from './utils/cache';
export { globalLoggerRegistry, AsyncLogger, LoggerRegistry } from './utils/logger';

// Export utility types
export type { BoundedCacheOptions, CacheAnalytics, CacheState, CleanupResult } from './utils/cache';
export type { LoggerOptions, LoggerStats, LogLevel } from './utils/logger';