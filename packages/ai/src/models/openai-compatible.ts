/**
 * OpenAI-compatible model configurations
 * For LM Studio, Ollama, DeepSeek, and other OpenAI-compatible providers
 * Following Vercel AI SDK patterns for consistency across apps
 */

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// Create LM Studio provider with explicit configuration
const lmstudioProvider = createOpenAICompatible({
  name: 'lmstudio',
  baseURL: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
  ...(process.env.LM_STUDIO_API_KEY && { apiKey: process.env.LM_STUDIO_API_KEY }),
});

export const LMSTUDIO_MODELS = {
  'lmstudio-chat': lmstudioProvider(process.env.LM_STUDIO_CHAT_MODEL || 'llama-3.2-1b'),
  'lmstudio-code': lmstudioProvider(process.env.LM_STUDIO_CODE_MODEL || 'deepseek-coder-1.3b'),
  'lmstudio-reasoning': lmstudioProvider(process.env.LM_STUDIO_REASONING_MODEL || 'llama-3.2-3b'),
} as const;

// Create Ollama provider with explicit configuration
const ollamaProvider = createOpenAICompatible({
  name: 'ollama',
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
  ...(process.env.OLLAMA_API_KEY && { apiKey: process.env.OLLAMA_API_KEY }),
});

export const OLLAMA_MODELS = {
  'ollama-chat': ollamaProvider(process.env.OLLAMA_CHAT_MODEL || 'llama3.2'),
  'ollama-code': ollamaProvider(process.env.OLLAMA_CODE_MODEL || 'deepseek-coder'),
  'ollama-reasoning': ollamaProvider(process.env.OLLAMA_REASONING_MODEL || 'qwen2.5'),
} as const;

// Create DeepSeek provider with explicit API key configuration
const deepseekProvider = createOpenAICompatible({
  name: 'deepseek',
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: process.env.DEEPSEEK_API_KEY ?? '',
});

export const DEEPSEEK_MODELS = {
  'deepseek-chat': deepseekProvider(process.env.DEEPSEEK_CHAT_MODEL || 'deepseek-chat'),
  'deepseek-reasoning': deepseekProvider(
    process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner',
  ),
  'deepseek-coder': deepseekProvider(process.env.DEEPSEEK_CODER_MODEL || 'deepseek-coder'),
} as const;

/**
 * Factory function for custom OpenAI-compatible providers
 * @param config - Provider configuration
 */
export function createCustomOpenAICompatibleProvider(config: {
  name: string;
  baseURL: string;
  apiKey?: string;
}) {
  return createOpenAICompatible(config);
}

// Re-export metadata
export {
  DEEPSEEK_MODEL_METADATA,
  LMSTUDIO_MODEL_METADATA,
  OLLAMA_MODEL_METADATA,
  OPENAI_COMPATIBLE_MODEL_METADATA,
} from './metadata';
