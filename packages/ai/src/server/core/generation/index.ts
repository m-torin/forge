/**
 * AI SDK v5 Generation Module
 * Enhanced text and structured data generation capabilities
 */

export * from './structured-data';

// Re-export core AI SDK generation functions for convenience
export { generateObject, generateText, streamObject, streamText } from 'ai';

export type {
  GenerateObjectResult,
  GenerateTextResult,
  LanguageModel,
  StreamObjectResult,
  StreamTextResult,
} from 'ai';
