// Provider registry and models - AI SDK v5 native patterns
// RAG tool exports (explicit for tree shaking)
export {
  createMultiRAGTool,
  createRAGMemoryTool,
  createRAGTool,
  createSemanticSearchTool,
  ragExamples,
} from './rag';

export type { MultiRAGOptions, RAGMemoryOptions, RAGOptions, SemanticSearchOptions } from './rag';

// Standard tool exports (explicit for tree shaking)
export {
  authCheckTool,
  commonToolSets,
  databaseQueryTool,
  fileSystemTool,
  getStandardToolsByCategory,
  httpRequestTool,
  sendEmailTool,
  standardTools,
  toolCategories,
  trackEventTool,
  webSearchTool,
} from './standard';

// Debug utilities and schema helpers
export { debugUtils } from './debug-utils';
export { schemaPromptEngineering, schemas } from './schema-fragments';

// Embeddings utilities
export { calculateSimilarity, embedBatch, embedText, type EmbeddingModelId } from './embeddings';

// Provider registry - single source of truth for all models
export { getDefaultModel, models, registry, type LanguageModelId } from '../providers/registry';

// Runtime options for consumer flexibility
export { createFlexibleTool, withRuntimeOptions, type RuntimeOptions } from './tool-wrappers';
