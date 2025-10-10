/**
 * Model Configuration and Registry
 * Centralized model management for the AI package
 */

// Core types and metadata
export type { ModelCapability, ModelMetadata, ReasoningConfig } from './metadata';

export {
  ANTHROPIC_MODEL_METADATA,
  DEEPSEEK_MODEL_METADATA,
  GOOGLE_MODEL_METADATA,
  LMSTUDIO_MODEL_METADATA,
  OLLAMA_MODEL_METADATA,
  OPENAI_COMPATIBLE_MODEL_METADATA,
  PERPLEXITY_MODEL_METADATA,
  XAI_MODEL_METADATA,
} from './metadata';

// Registry and configuration
export type { ModelRegistry, ProviderModelConfig } from './registry';

export {
  CODE_MODELS,
  COMPUTER_USE_MODELS,
  MODEL_ALIASES,
  MODEL_REGISTRY,
  REASONING_MODELS,
  VISION_MODELS,
  getAllModelIds,
  getBestModelForTask,
  getChatModels,
  getModelConfig,
  getModelProvider,
  getModelReasoningConfig,
  getModelsByCapability,
  getModelsByProvider,
  getProviderModelId,
  isDeprecatedModel,
  isValidModelId,
  modelHasCapability,
  modelSupportsReasoning,
} from './registry';

// Utility functions
export type {
  ModelSelectionConfig,
  ModelSelectionStrategy,
  ModelUsageStats,
  UserTier,
} from './utils';

export {
  MODEL_STRATEGIES,
  USER_TIER_LIMITS,
  canUserAccessModel,
  compareModels,
  getAllUsageStats,
  getModelFeatureMatrix,
  getModelRecommendations,
  getModelUsageStats,
  selectModel,
  trackModelUsage,
  validateModelForUseCase,
} from './utils';
