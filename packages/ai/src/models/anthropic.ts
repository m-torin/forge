import { anthropic } from '@ai-sdk/anthropic';

/**
 * Shared Anthropic model configurations
 * Following Vercel AI SDK patterns for consistency across apps
 * Server-side only (requires @ai-sdk/anthropic)
 */

// Models that support reasoning (as per official docs)
const REASONING_MODELS = [
  'claude-4-opus-20250514',
  'claude-4-sonnet-20250514',
  'claude-3-7-sonnet-20250219',
] as const;

// Models that support PDF processing (as per official docs)
const PDF_SUPPORTED_MODELS = ['claude-3-5-sonnet-20241022', 'claude-3-5-sonnet-20240620'] as const;

// Models that support computer tools (as per official docs)
const COMPUTER_TOOLS_MODELS = ['claude-3-5-sonnet-20241022'] as const;

// Models that support image input (as per official docs)
const IMAGE_INPUT_MODELS = [
  'claude-4-opus-20250514',
  'claude-4-sonnet-20250514',
  'claude-3-7-sonnet-20250219',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
] as const;

// Models that support object generation (as per official docs)
const OBJECT_GENERATION_MODELS = [
  'claude-4-opus-20250514',
  'claude-4-sonnet-20250514',
  'claude-3-7-sonnet-20250219',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
] as const;

// Models that support tool usage (as per official docs)
const TOOL_USAGE_MODELS = [
  'claude-4-opus-20250514',
  'claude-4-sonnet-20250514',
  'claude-3-7-sonnet-20250219',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
] as const;

export const ANTHROPIC_MODELS = {
  // Claude 4 models (latest) - as per official docs
  'claude-4-opus-20250514': anthropic('claude-4-opus-20250514'),
  'claude-4-sonnet-20250514': anthropic('claude-4-sonnet-20250514'),

  // Claude 3.7 models - as per official docs
  'claude-3-7-sonnet-20250219': anthropic('claude-3-7-sonnet-20250219'),

  // Claude 3.5 models - as per official docs
  'claude-3-5-sonnet-20241022': anthropic('claude-3-5-sonnet-20241022'),
  'claude-3-5-sonnet-20240620': anthropic('claude-3-5-sonnet-20240620'),
  'claude-3-5-haiku-20241022': anthropic('claude-3-5-haiku-20241022'),

  // Claude 3 models (legacy) - as per official docs
  'claude-3-opus-20240229': anthropic('claude-3-opus-20240229'),
  'claude-3-sonnet-20240229': anthropic('claude-3-sonnet-20240229'),
  'claude-3-haiku-20240307': anthropic('claude-3-haiku-20240307'),

  /** @deprecated Use specific Claude model names instead */
  'claude-chat': anthropic('claude-4-sonnet-20250514'),
  /** @deprecated Use specific Claude model names instead */
  'claude-reasoning': anthropic('claude-4-sonnet-20250514'),
  /** @deprecated Use specific Claude model names instead */
  'claude-artifacts': anthropic('claude-3-5-sonnet-20241022'),
  /** @deprecated Use specific Claude model names instead */
  'claude-title': anthropic('claude-3-5-haiku-20241022'),
} as const;

// Helper functions to check model capabilities (as per official docs)
export function isReasoningModel(modelId: string): boolean {
  return REASONING_MODELS.includes(modelId as any);
}

export function isPDFSupportedModel(modelId: string): boolean {
  return PDF_SUPPORTED_MODELS.includes(modelId as any);
}

export function isComputerToolsModel(modelId: string): boolean {
  return COMPUTER_TOOLS_MODELS.includes(modelId as any);
}

export function isImageInputModel(modelId: string): boolean {
  return IMAGE_INPUT_MODELS.includes(modelId as any);
}

export function isObjectGenerationModel(modelId: string): boolean {
  return OBJECT_GENERATION_MODELS.includes(modelId as any);
}

export function isToolUsageModel(modelId: string): boolean {
  return TOOL_USAGE_MODELS.includes(modelId as any);
}

// Get model capabilities as per official documentation
export function getModelCapabilities(modelId: string): {
  imageInput: boolean;
  objectGeneration: boolean;
  toolUsage: boolean;
  computerUse: boolean;
  reasoningText: boolean;
  pdfSupport: boolean;
} {
  return {
    imageInput: isImageInputModel(modelId),
    objectGeneration: isObjectGenerationModel(modelId),
    toolUsage: isToolUsageModel(modelId),
    computerUse: isComputerToolsModel(modelId),
    reasoningText: isReasoningModel(modelId),
    pdfSupport: isPDFSupportedModel(modelId),
  };
}

// Re-export metadata from shared location
export { ANTHROPIC_MODEL_METADATA } from './metadata';
