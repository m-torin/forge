import { xai } from '@ai-sdk/xai';

/**
 * Shared XAI model configurations
 * Following Vercel AI SDK patterns for consistency across apps
 * Server-side only (requires @ai-sdk/xai)
 */

export const XAI_MODELS = {
  'chat-model': xai('grok-2-vision-1212'),
  'chat-model-reasoning': xai('grok-3-mini-beta'), // Raw model, middleware applied later
  'title-model': xai('grok-2-1212'),
  'artifact-model': xai('grok-2-1212'),
} as const;

export const XAI_IMAGE_MODELS: Record<string, any> = {
  'small-model': xai.image('grok-2-image'),
} as const;

// Re-export metadata from shared location
export { XAI_MODEL_METADATA } from './metadata';
