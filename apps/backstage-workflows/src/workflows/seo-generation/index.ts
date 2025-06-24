// SEO Generation Workflow - Export Barrel
// Centralized exports for the SEO content generation workflow

export * from './types';
export * from './config';
export * from './redis-tracker';
export * from './actions';
export * from './utils';
export * from './processors';
export * from './workflow';

// Re-export commonly used functions
export {
  fetchProductsForSeo,
  shouldSkipSeoGeneration,
  updateProductSeoEnhanced,
  getSeoProcessingStats,
} from './actions';

export { categorizeProductsBySeoStrategy, validateSeoContentStructure } from './utils';

export {
  validateProductForSeo,
  generateSeoWithLMStudio,
  optimizeSeoWithClaude,
  processSeoWithRetry,
} from './processors';

export { mainSeoWorkflow, processSeoGenerationBatch } from './workflow';

export {
  trackSeoProgress,
  trackSeoWorkflowProgress,
  updateSeoBatchStats,
  getSeoWorkflowProgress,
  trackTokenUsage,
} from './redis-tracker';

export {
  SEO_CONFIG,
  SEO_REDIS_KEYS,
  getSeoProcessingRules,
  generateSeoSlug,
  determineProductPriority,
} from './config';
