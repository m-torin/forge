/**
 * AI SDK Tools Index
 * Centralized exports for all Vercel AI SDK tools
 * Following best practices for tool organization and discovery
 */

// AI SDK-compliant tools (recommended)
// Legacy complex tool system (deprecated but kept for compatibility)
import {
  createDocumentTool,
  searchDocumentsTool,
  updateDocumentTool,
} from './implementations/document';
import { enhancedWeatherTool, weatherTool } from './implementations/weather';
import { globalToolRegistry, registerDefaultTools } from './registry';

export * from './ai-sdk-tools';

export {
  commonToolSchemas,
  createAsyncTool,
  createBatchTool,
  createCRUDTools,
  createEnhancedTool,
  createSearchTool,
  type ToolContext,
  type ToolFactoryConfig,
} from './enhanced-factory';
export * from './factory';
// Tool registry - specific exports to avoid conflicts
export {
  createToolsFromRegistry,
  globalToolRegistry,
  registerDefaultTools,
  ToolRegistry,
  type ToolMetadata as LegacyToolMetadata,
} from './registry';

export { EnhancedTool } from './execution-framework';
export * from './specifications';
export * from './types';

export type {
  EnhancedToolDefinition,
  ToolMetadata as ExecutionToolMetadata,
  ToolExecutionContext,
  ToolSecurityConfig,
} from './execution-framework';

// Tool implementations
export {
  createDocumentTool,
  searchDocumentsTool,
  updateDocumentTool,
} from './implementations/document';
export { enhancedWeatherTool, weatherTool } from './implementations/weather';

// Vector tools (Upstash Vector specific)
export {
  createBulkTools,
  type BulkOperationProgress,
  type BulkTools,
  type BulkToolsConfig,
} from './bulk-tools';
export {
  createMetadataTools,
  type MetadataTools,
  type MetadataToolsConfig,
} from './metadata-tools';
export {
  createNamespaceTools,
  type NamespaceTools,
  type NamespaceToolsConfig,
} from './namespace-tools';
export {
  createRangeTools,
  type PaginationState,
  type RangeTools,
  type RangeToolsConfig,
} from './range-tools';
export { createVectorTools, type VectorToolsConfig } from './vector-tools';

// Register all standard tools on import
registerDefaultTools();

// Register implementation tools
globalToolRegistry.register('weather', weatherTool, {
  category: 'external',
  tags: ['weather', 'location'],
  security: 'low',
});

globalToolRegistry.register('enhancedWeather', enhancedWeatherTool, {
  category: 'external',
  tags: ['weather', 'location', 'enhanced'],
  security: 'low',
});

globalToolRegistry.register('createDocument', createDocumentTool, {
  category: 'document',
  tags: ['create', 'write'],
  security: 'medium',
});

globalToolRegistry.register('updateDocument', updateDocumentTool, {
  category: 'document',
  tags: ['update', 'edit'],
  security: 'medium',
});

globalToolRegistry.register('searchKnowledge', searchDocumentsTool, {
  category: 'search',
  tags: ['search', 'query', 'knowledge'],
  security: 'low',
});

// Convenience function to get all standard tools
export function getAllStandardTools(context?: any) {
  return globalToolRegistry.getAll(context);
}

// Combined vector tool suite
export function createAllVectorTools() {
  // Vector tools would be imported and used here
  // This is a placeholder implementation
  return {
    // Vector operations would be returned here
    // Currently returning empty object to maintain compatibility
  };
}

export type AllVectorTools = ReturnType<typeof createAllVectorTools>;

// Legacy weather tool export for backward compatibility
export { getWeather } from './weather';
