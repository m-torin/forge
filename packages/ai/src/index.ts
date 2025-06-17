/**
 * Main AI package exports
 *
 * This is the primary entry point for the AI package.
 * Use specific imports for better tree-shaking and environment safety:
 * - '@repo/ai/client' for client-side
 * - '@repo/ai/server' for server-side
 * - '@repo/ai/client/next' for Next.js client
 * - '@repo/ai/server/next' for Next.js server
 */

export { aiKeys } from '../keys';
export * from './shared/features';
export { AIProductClassifier } from './shared/features/classification/product-classifier';
export { ClassificationTrainingSystem } from './shared/features/classification/training-system';

export { createAnthropicModerationService } from './shared/features/moderation/anthropic-moderation';
export * from './shared/providers';
export { BaseProvider } from './shared/providers/base-provider';
export { ProviderRegistry } from './shared/providers/registry';
// Main entry point - general exports and types
export * from './shared/types';
export * from './shared/utils';

// Configuration utilities
export { createConfigFromEnv } from './shared/utils/config';
// Re-export key classes for convenience
export { AIManager } from './shared/utils/manager';
