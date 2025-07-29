/**
 * AI SDK Tools Index
 * Centralized exports for all Vercel AI SDK tools
 * Following best practices for tool organization and discovery
 */

// AI SDK-compliant tools (recommended)
// Legacy complex tool system (deprecated but kept for compatibility)
import { createBulkTools } from './bulk-tools';
import {
  createDocumentTool,
  searchDocumentsTool,
  updateDocumentTool,
} from './implementations/document';
import { enhancedWeatherTool, weatherTool } from './implementations/weather';
import { createMetadataTools } from './metadata-tools';
import { createNamespaceTools } from './namespace-tools';
import { createRangeTools } from './range-tools';
import { globalToolRegistry, registerDefaultTools } from './registry';
import { createVectorTools } from './vector-tools';

export * from './ai-sdk-tools';

// Simple, working tool factories for AI SDK v5 (recommended)
export * from './factory-simple';

// Complex tool factories (deprecated - use factory-simple for AI SDK v5)
/** @deprecated Use factory-simple exports instead for AI SDK v5 compatibility */
export {
  commonToolSchemas,
  createAsyncTool,
  createBatchTool,
  createCRUDTools,
  createEnhancedTool,
  createSearchTool,
  type ToolFactoryConfig,
} from './enhanced-factory';
/** @deprecated Use factory-simple exports instead for AI SDK v5 compatibility */
export {
  combineTools,
  createAPITool,
  createSecureTool,
  createStreamingTool,
  commonSchemas as legacyCommonSchemas,
  tool,
  type ToolContext as LegacyToolContext,
} from './factory';
// Tool registry - specific exports to avoid conflicts
export {
  createToolsFromRegistry,
  globalToolRegistry,
  registerDefaultTools,
  ToolRegistry,
  /** @deprecated Use AISDKToolMetadata instead */
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
export function createAllVectorTools(config: {
  vectorDB: any;
  embeddingModel?: string;
  defaultNamespace?: string;
  defaultTopK?: number;
  similarityThreshold?: number;
  defaultBatchSize?: number;
  maxConcurrency?: number;
}) {
  // Import all tool creation functions
  const vectorTools = createVectorTools(config);
  const namespaceTools = createNamespaceTools(config);
  const metadataTools = createMetadataTools(config);
  const rangeTools = createRangeTools(config);
  const bulkTools = createBulkTools(config);

  return {
    ...vectorTools,
    ...namespaceTools,
    ...metadataTools,
    ...rangeTools,
    ...bulkTools,
  };
}

export type AllVectorTools = ReturnType<typeof createAllVectorTools>;

/**
 * Legacy weather tool export for backward compatibility
 * @deprecated Use weatherTool or enhancedWeatherTool from './implementations/weather' instead
 */
export { getWeather } from './weather';
