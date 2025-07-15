/**
 * AI SDK v5 Lifecycle Management
 * Enhanced hooks and lifecycle control for AI model interactions
 */

export * from './lifecycle-hooks';

// Re-export for convenience
export {
  LifecycleManager,
  chainHooks,
  createLifecycleManager,
  createLifecycleWrapper,
  lifecyclePresets,
  wrapModelWithLifecycle,
  type CompletionHookContext,
  type ErrorHookContext,
  type GenerationHookContext,
  type GenerationHookResult,
  type LifecycleContext,
  type LifecycleHooks,
  type ToolCallHookContext,
} from './lifecycle-hooks';
