/**
 * MCP Utils - Tools Index
 * Exports all MCP tool definitions
 */

// Safe stringify tools
export {
  safeStringifyTool,
  legacySafeStringifyTool
} from './safe-stringify';

// Agent utility tools
export {
  extractObservationTool,
  createEntityNameTool,
  validateAgentRequestTool,
  formatAgentResponseTool
} from './agent-utilities';

// Bounded cache tools
export {
  createBoundedCacheTool,
  cacheOperationTool,
  cacheAnalyticsTool,
  cacheCleanupTool
} from './bounded-cache';

// Async logger tools
export {
  createAsyncLoggerTool,
  logMessageTool,
  loggerStatsTool,
  loggerManagementTool
} from './async-logger';

// Collect all tools for easy registration
export const ALL_TOOLS = [
  // String utilities
  'safeStringifyTool',
  'legacySafeStringifyTool',
  
  // Cache utilities
  'createBoundedCacheTool',
  'cacheOperationTool', 
  'cacheAnalyticsTool',
  'cacheCleanupTool',
  
  // Logger utilities
  'createAsyncLoggerTool',
  'logMessageTool',
  'loggerStatsTool',
  'loggerManagementTool',
  
  // Agent utilities
  'extractObservationTool',
  'createEntityNameTool',
  'validateAgentRequestTool',
  'formatAgentResponseTool'
];