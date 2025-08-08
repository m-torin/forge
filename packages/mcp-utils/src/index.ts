/**
 * MCP Utils TypeScript Main Export
 * Provides centralized utilities for Claude Code agents
 */

// Re-export utility functions for TypeScript consumption
export {
  createEntityName,
  extractObservation,
  formatAgentResponse,
  validateAgentRequest,
} from './utils/agent-helpers';
export { SafeStringifier, safeStringify, safeStringifyAdvanced } from './utils/stringify';

// Export types for better TypeScript support
export type {
  AgentRequest,
  AgentResponse,
  EntityType,
  MCPEntity,
  ValidationResult,
} from './utils/agent-helpers';

export type { SafeStringifyOptions, SafeStringifyResult } from './utils/stringify';

// Export tools for MCP server usage
export * from './tools';

// Re-export utility registries
export { BoundedCache, CacheRegistry, globalCacheRegistry } from './utils/cache';
export { AsyncLogger, LoggerRegistry, globalLoggerRegistry } from './utils/logger';

// Export utility types
export type { BoundedCacheOptions, CacheAnalytics, CacheState, CleanupResult } from './utils/cache';
export type { LogLevel, LoggerOptions, LoggerStats } from './utils/logger';

// Export code analysis utilities
export {
  calculateComplexity,
  extractExports,
  extractFileMetadata,
  extractImports,
} from './utils/code-analysis';
export type { FileMetadata } from './utils/code-analysis';

// Export session management
export { closeAgentSession, getSessionCacheKey, initializeAgentSession } from './utils/session';
export type { AgentSession, SessionOptions } from './utils/session';

// Export retry utilities
export { RetryPredicates, retryOperation, retryParallel, retrySequential } from './utils/retry';
export type { RetryOptions } from './utils/retry';

// Export tool helpers and MCP types
export type { MCPErrorResponse, MCPTextContent, MCPToolResponse } from './types/mcp';
export { err, ok, runTool, text } from './utils/tool-helpers';
