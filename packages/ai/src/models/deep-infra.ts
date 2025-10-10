/**
 * Deep Infra model configurations
 * Following Vercel AI SDK patterns for consistency across apps
 */

import { deepinfra } from '@ai-sdk/deepinfra';

/**
 * Deep Infra Model Capabilities
 * As per official documentation
 */

// Models that support image input
const IMAGE_INPUT_MODELS = [
  'meta-llama/Llama-3.2-11B-Vision-Instruct',
  'meta-llama/Llama-3.2-90B-Vision-Instruct',
] as const;

// Models that support object generation
const OBJECT_GENERATION_MODELS = [
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
  'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  'meta-llama/Llama-3.3-70B-Instruct',
  'meta-llama/Meta-Llama-3.1-405B-Instruct',
  'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-70B-Instruct',
  'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-8B-Instruct',
  'meta-llama/Llama-3.2-11B-Vision-Instruct',
  'meta-llama/Llama-3.2-90B-Vision-Instruct',
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
  'deepseek-ai/DeepSeek-V3',
  'deepseek-ai/DeepSeek-R1',
  'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
  'deepseek-ai/DeepSeek-R1-Turbo',
  'nvidia/Llama-3.1-Nemotron-70B-Instruct',
  'Qwen/Qwen2-7B-Instruct',
  'Qwen/Qwen2.5-72B-Instruct',
  'Qwen/Qwen2.5-Coder-32B-Instruct',
  'Qwen/QwQ-32B-Preview',
  'google/codegemma-7b-it',
  'google/gemma-2-9b-it',
  'microsoft/WizardLM-2-8x22B',
] as const;

// Models that support tool usage
const TOOL_USAGE_MODELS = [
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
  'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  'meta-llama/Llama-3.3-70B-Instruct',
  'meta-llama/Meta-Llama-3.1-405B-Instruct',
  'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-70B-Instruct',
  'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-8B-Instruct',
  'meta-llama/Llama-3.2-11B-Vision-Instruct',
  'meta-llama/Llama-3.2-90B-Vision-Instruct',
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
  'deepseek-ai/DeepSeek-V3',
  'deepseek-ai/DeepSeek-R1',
  'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
  'deepseek-ai/DeepSeek-R1-Turbo',
  'nvidia/Llama-3.1-Nemotron-70B-Instruct',
  'Qwen/Qwen2-7B-Instruct',
  'Qwen/Qwen2.5-72B-Instruct',
  'Qwen/Qwen2.5-Coder-32B-Instruct',
  'Qwen/QwQ-32B-Preview',
  'google/codegemma-7b-it',
  'google/gemma-2-9b-it',
  'microsoft/WizardLM-2-8x22B',
] as const;

// Models that support tool streaming
const TOOL_STREAMING_MODELS = [
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
  'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  'meta-llama/Llama-3.3-70B-Instruct',
  'meta-llama/Meta-Llama-3.1-405B-Instruct',
  'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-70B-Instruct',
  'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-8B-Instruct',
  'meta-llama/Llama-3.2-11B-Vision-Instruct',
  'meta-llama/Llama-3.2-90B-Vision-Instruct',
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
  'deepseek-ai/DeepSeek-V3',
  'deepseek-ai/DeepSeek-R1',
  'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
  'deepseek-ai/DeepSeek-R1-Turbo',
  'nvidia/Llama-3.1-Nemotron-70B-Instruct',
  'Qwen/Qwen2-7B-Instruct',
  'Qwen/Qwen2.5-72B-Instruct',
  'Qwen/Qwen2.5-Coder-32B-Instruct',
  'Qwen/QwQ-32B-Preview',
  'google/codegemma-7b-it',
  'google/gemma-2-9b-it',
  'microsoft/WizardLM-2-8x22B',
] as const;

export const DEEPINFRA_MODELS = {
  // Meta Llama models (as per official docs)
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8': deepinfra(
    'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
  ),
  'meta-llama/Llama-4-Scout-17B-16E-Instruct': deepinfra(
    'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  ),
  'meta-llama/Llama-3.3-70B-Instruct-Turbo': deepinfra('meta-llama/Llama-3.3-70B-Instruct-Turbo'),
  'meta-llama/Llama-3.3-70B-Instruct': deepinfra('meta-llama/Llama-3.3-70B-Instruct'),
  'meta-llama/Meta-Llama-3.1-405B-Instruct': deepinfra('meta-llama/Meta-Llama-3.1-405B-Instruct'),
  'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo': deepinfra(
    'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  ),
  'meta-llama/Meta-Llama-3.1-70B-Instruct': deepinfra('meta-llama/Meta-Llama-3.1-70B-Instruct'),
  'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo': deepinfra(
    'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  ),
  'meta-llama/Meta-Llama-3.1-8B-Instruct': deepinfra('meta-llama/Meta-Llama-3.1-8B-Instruct'),
  'meta-llama/Llama-3.2-11B-Vision-Instruct': deepinfra('meta-llama/Llama-3.2-11B-Vision-Instruct'),
  'meta-llama/Llama-3.2-90B-Vision-Instruct': deepinfra('meta-llama/Llama-3.2-90B-Vision-Instruct'),

  // Mistral models (as per official docs)
  'mistralai/Mixtral-8x7B-Instruct-v0.1': deepinfra('mistralai/Mixtral-8x7B-Instruct-v0.1'),

  // DeepSeek models (as per official docs)
  'deepseek-ai/DeepSeek-V3': deepinfra('deepseek-ai/DeepSeek-V3'),
  'deepseek-ai/DeepSeek-R1': deepinfra('deepseek-ai/DeepSeek-R1'),
  'deepseek-ai/DeepSeek-R1-Distill-Llama-70B': deepinfra(
    'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
  ),
  'deepseek-ai/DeepSeek-R1-Turbo': deepinfra('deepseek-ai/DeepSeek-R1-Turbo'),

  // NVIDIA models (as per official docs)
  'nvidia/Llama-3.1-Nemotron-70B-Instruct': deepinfra('nvidia/Llama-3.1-Nemotron-70B-Instruct'),

  // Qwen models (as per official docs)
  'Qwen/Qwen2-7B-Instruct': deepinfra('Qwen/Qwen2-7B-Instruct'),
  'Qwen/Qwen2.5-72B-Instruct': deepinfra('Qwen/Qwen2.5-72B-Instruct'),
  'Qwen/Qwen2.5-Coder-32B-Instruct': deepinfra('Qwen/Qwen2.5-Coder-32B-Instruct'),
  'Qwen/QwQ-32B-Preview': deepinfra('Qwen/QwQ-32B-Preview'),

  // Google models (as per official docs)
  'google/codegemma-7b-it': deepinfra('google/codegemma-7b-it'),
  'google/gemma-2-9b-it': deepinfra('google/gemma-2-9b-it'),

  // Microsoft models (as per official docs)
  'microsoft/WizardLM-2-8x22B': deepinfra('microsoft/WizardLM-2-8x22B'),

  /** @deprecated Use full model names instead */
  'llama-3.1-70b': deepinfra('meta-llama/Meta-Llama-3.1-70B-Instruct'),
  /** @deprecated Use full model names instead */
  'llama-3.1-34b': deepinfra('meta-llama/Meta-Llama-3.1-34B-Instruct'),
  /** @deprecated Use full model names instead */
  'llama-3.1-8b': deepinfra('meta-llama/Meta-Llama-3.1-8B-Instruct'),
  /** @deprecated Use full model names instead */
  'qwen-72b': deepinfra('Qwen/Qwen2.5-72B-Instruct'),
  /** @deprecated Use full model names instead */
  'qwen-14b': deepinfra('Qwen/Qwen-14B-Chat'),
  /** @deprecated Use full model names instead */
  'qwen-7b': deepinfra('Qwen/Qwen2-7B-Instruct'),
  /** @deprecated Use full model names instead */
  'deepseek-67b': deepinfra('deepseek-ai/deepseek-67b-chat'),
  'deepseek-33b': deepinfra('deepseek-ai/deepseek-33b-chat'),
  'deepseek-7b': deepinfra('deepseek-ai/deepseek-7b-chat'),
  'deepseek-r1-distill': deepinfra('deepseek-ai/DeepSeek-R1-Distill-Llama-70B'),
} as const;

type DeepInfraModelId = keyof typeof DEEPINFRA_MODELS;

// Helper functions to check model capabilities (as per official docs)
export function isImageInputModel(modelId: string): boolean {
  return IMAGE_INPUT_MODELS.includes(modelId as any);
}

export function isObjectGenerationModel(modelId: string): boolean {
  return OBJECT_GENERATION_MODELS.includes(modelId as any);
}

export function isToolUsageModel(modelId: string): boolean {
  return TOOL_USAGE_MODELS.includes(modelId as any);
}

export function isToolStreamingModel(modelId: string): boolean {
  return TOOL_STREAMING_MODELS.includes(modelId as any);
}

// Get model capabilities as per official documentation
export function getModelCapabilities(modelId: string): {
  imageInput: boolean;
  objectGeneration: boolean;
  toolUsage: boolean;
  toolStreaming: boolean;
} {
  return {
    imageInput: isImageInputModel(modelId),
    objectGeneration: isObjectGenerationModel(modelId),
    toolUsage: isToolUsageModel(modelId),
    toolStreaming: isToolStreamingModel(modelId),
  };
}

// Note: This function was removed because LanguageModel no longer has a `provider` property in AI SDK v5
// If you need to check the model type, use the model ID directly or implement custom model identification
// export function isDeepInfraModel(
//   model: LanguageModel,
// ): model is (typeof DEEPINFRA_MODELS)[DeepInfraModelId] {
//   return model.provider === 'deepinfra';
// }
