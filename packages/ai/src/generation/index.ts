// Existing chat helpers
export { Chat } from './chat';

// Text generation exports (explicit for tree shaking)
export {
  generateBatch,
  generateForDomain,
  generateText,
  // AI SDK v5 Experimental Structured Output
  generateTextWithStructuredOutput,
  generateWithModel,
} from './text';

// Object generation exports (explicit for tree shaking)
export {
  // Common schemas and helpers
  commonSchemas,
  // AI SDK v5 Enhanced Object Generation
  generateArray,
  generateCommon,
  generateEnum,
  generateNoSchema,
  generateObject,
  generateObjectWithModel,
  generateValidatedObject,
  streamArray,
  streamObject,
  streamObjectWithPartials,
} from './object';

// Stream generation exports (explicit for tree shaking)
export {
  StreamProcessor,
  processFullStream,
  streamForDomain,
  streamText,
  // AI SDK v5 Enhanced Streaming
  streamTextWithFullStream,
  streamTextWithProcessor,
  streamTextWithProgress,
  streamTextWithRateLimit,
  // AI SDK v5 Experimental Structured Streaming
  streamTextWithStructuredOutput,
  streamUtils,
} from './stream';

// Types
export type { ChatConfig, ChatResult } from '../core/types';
