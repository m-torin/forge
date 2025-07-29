/**
 * AI SDK v5 Advanced Middleware System
 * Enhanced model behavior with logging, caching, and custom transformations
 */

export * from './caching-middleware';
export * from './error-recovery';
export * from './logging-middleware';
export * from './retry-middleware';

// Re-export core AI SDK middleware for convenience
export {
  defaultSettingsMiddleware,
  extractReasoningMiddleware,
  simulateStreamingMiddleware,
  wrapLanguageModel,
} from 'ai';

// Note: These types may not be exported in current AI SDK v5 build
// Use direct imports in individual files as needed
// export type {
//   LanguageModelV2Middleware,
//   LanguageModelV2MiddlewareStack,
// } from 'ai';
