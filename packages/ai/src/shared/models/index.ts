/**
 * Model Configuration and Registry
 * Centralized model management for the AI package
 */

// Core types and metadata
export type {
  ModelCapability,
  ReasoningConfig,
  ModelMetadata,
} from './metadata';

export {
  ANTHROPIC_MODEL_METADATA,
  PERPLEXITY_MODEL_METADATA,
  XAI_MODEL_METADATA,
  GOOGLE_MODEL_METADATA,
  LMSTUDIO_MODEL_METADATA,
  OLLAMA_MODEL_METADATA,
  DEEPSEEK_MODEL_METADATA,
  OPENAI_COMPATIBLE_MODEL_METADATA,
} from './metadata';

// Registry and configuration
export type {
  ProviderModelConfig,
  ModelRegistry,
} from './registry';

export {
  MODEL_REGISTRY,
  MODEL_ALIASES,
  getModelConfig,
  getModelsByProvider,
  getModelsByCapability,
  modelHasCapability,
  modelSupportsReasoning,
  getModelReasoningConfig,
  getAllModelIds,
  getChatModels,
  getBestModelForTask,
  REASONING_MODELS,
  VISION_MODELS,
  CODE_MODELS,
  COMPUTER_USE_MODELS,
  isValidModelId,
  isDeprecatedModel,
  getProviderModelId,
  getModelProvider,
} from './registry';

// Utility functions
export type {
  ModelSelectionStrategy,
  UserTier,
  ModelSelectionConfig,
  ModelUsageStats,
} from './utils';

export {
  MODEL_STRATEGIES,
  USER_TIER_LIMITS,
  selectModel,
  canUserAccessModel,
  getModelRecommendations,
  validateModelForUseCase,
  trackModelUsage,
  getModelUsageStats,
  getAllUsageStats,
  compareModels,
  getModelFeatureMatrix,
} from './utils';