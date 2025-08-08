/**
 * AI SDK v5 React Server Components (RSC) Support
 * Streaming UI components and values from server to client
 */

export * from './ai-context';
export * from './render';
export * from './stream-ui';
export * from './streamable-ui';
export * from './streamable-value';

// Re-export from AI SDK for convenience - using stable API
export {
  createAI,
  createStreamableUI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
  readStreamableValue,
  streamUI,
  useAIState,
  useActions,
  useStreamableValue,
  useSyncUIState,
  useUIState,
} from '@ai-sdk/rsc';
