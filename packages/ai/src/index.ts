// Main entry point - general exports and types
export * from './shared/types';
export * from './shared/features';
export * from './shared/providers';
export * from './shared/utils';

// Re-export key classes for convenience
export { AIManager } from './shared/utils/manager';
export { BaseProvider } from './shared/providers/base-provider';
export { ProviderRegistry } from './shared/providers/registry';
export { AIProductClassifier } from './shared/features/classification/product-classifier';
export { ClassificationTrainingSystem } from './shared/features/classification/training-system';
export { createAnthropicModerationService } from './shared/features/moderation/anthropic-moderation';

// Configuration utilities
export { createConfigFromEnv } from './shared/utils/config';
export { aiKeys } from '../keys';
