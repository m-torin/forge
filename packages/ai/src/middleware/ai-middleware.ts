/**
 * Official AI SDK v5 Middleware Patterns
 * Pure AI SDK v5 alignment - no custom middleware implementations
 * All functionality handled by official wrapLanguageModel + defaultSettingsMiddleware
 */

import { logDebug, logError, logInfo } from '@repo/observability';
import { defaultSettingsMiddleware, wrapLanguageModel } from 'ai';

/**
 * Official AI SDK v5 middleware helpers
 * These are convenience functions that use ONLY official SDK patterns
 */

/**
 * Create a wrapped model with official middleware patterns
 * Replaces all custom withRetry, withErrorHandling, withMetrics
 */
export function createWrappedModel(baseModel: any, settings?: any) {
  return wrapLanguageModel({
    model: baseModel,
    middleware: settings ? [defaultSettingsMiddleware({ settings })] : [],
  });
}

/**
 * Observability hooks that work with official AI SDK v5 patterns
 * Use these in onStepFinish, onFinish callbacks of official SDK functions
 */
export const observabilityHooks = {
  /**
   * Log operation start - use in function start
   */
  logStart: (operation: string, config: { model?: string }) => {
    logInfo('AI operation started', { operation, model: config.model });
  },

  /**
   * Log operation completion - use in onFinish callback
   */
  logComplete: (operation: string, config: { model?: string }, duration: number) => {
    logInfo('AI operation completed', { operation, duration, model: config.model });
  },

  /**
   * Log operation error - use in try/catch blocks
   */
  logError: (operation: string, config: { model?: string }, error: any, duration?: number) => {
    logError('AI operation failed', { operation, duration, model: config.model, error });
  },

  /**
   * Log step completion - use in onStepFinish callbacks
   */
  logStep: (stepNumber: number, finishReason: string, toolCallsCount: number) => {
    logDebug('AI step completed', { stepNumber, finishReason, toolCallsCount });
  },
};

/**
 * DEPRECATED - Use official AI SDK v5 patterns instead
 *
 * Instead of custom middleware, use:
 * - wrapLanguageModel() with defaultSettingsMiddleware()
 * - onStepFinish callbacks for metrics
 * - try/catch blocks for error handling
 * - Native SDK retry mechanisms
 */
const DEPRECATED = {
  message: 'Custom middleware deprecated. Use official AI SDK v5 wrapLanguageModel patterns.',
  migration: {
    withRetry: 'Use native SDK retry mechanisms and error handling',
    withErrorHandling: 'Use try/catch with observabilityHooks.logError',
    withMetrics: 'Use onStepFinish/onFinish callbacks with observabilityHooks',
    composeMiddleware: 'Use wrapLanguageModel with middleware array',
  },
};
