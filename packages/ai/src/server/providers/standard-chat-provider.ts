import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { perplexity } from '@ai-sdk/perplexity';
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  type LanguageModel,
  type Provider,
} from 'ai';
import { getRawEnv, safeEnv } from '../../../env';
import { createDeepInfraModel } from './ai-sdk-utils';

export interface StandardChatProviderConfig {
  /** Test models for testing environment */
  testModels?: Record<string, LanguageModel>;
  /** Function to check if in test environment */
  testEnvironmentCheck?: () => boolean;
  /** Enable reasoning middleware */
  enableReasoning?: boolean;
  /** Tag name for reasoning (default: 'think') */
  reasoningTagName?: string;
  /** Enable local model providers */
  enableLocalModels?: boolean;
  /** Enable LM Studio */
  enableLMStudio?: boolean;
  /** Enable Ollama */
  enableOllama?: boolean;
  /** Enable DeepSeek */
  enableDeepSeek?: boolean;
  /** Enable DeepInfra */
  enableDeepInfra?: boolean;
}

/**
 * Creates a standardized chat provider with all AI providers configured
 */
export function createStandardChatProvider(config: StandardChatProviderConfig = {}): Provider {
  const {
    testModels = {},
    testEnvironmentCheck,
    enableReasoning = false,
    reasoningTagName = 'think',
    enableLocalModels = false,
    enableLMStudio = false,
    enableOllama = false,
    enableDeepSeek = false,
    enableDeepInfra = false,
  } = config;

  // Check if in test environment
  const isTestEnvironment = testEnvironmentCheck?.() || false;

  if (isTestEnvironment && Object.keys(testModels).length > 0) {
    // Return test provider with mock models
    const languageModels: Record<string, LanguageModel> = { ...testModels };

    // Apply reasoning middleware if enabled
    if (enableReasoning) {
      Object.entries(languageModels).forEach(([modelId, model]) => {
        if (modelId.includes('reasoning')) {
          languageModels[modelId] = wrapLanguageModel({
            model,
            middleware: extractReasoningMiddleware({
              tagName: reasoningTagName,
            }),
          });
        }
      });
    }

    return customProvider({
      languageModels,
    });
  }

  // Production provider configuration
  const languageModels: Record<string, LanguageModel> = {};
  const env = safeEnv();
  const rawEnv = getRawEnv();

  // Anthropic models (always available in our setup)
  if (env.ANTHROPIC_API_KEY) {
    const claudeModels = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];

    claudeModels.forEach(modelId => {
      const model = anthropic(modelId);
      languageModels[modelId] =
        enableReasoning && modelId.includes('opus')
          ? wrapLanguageModel({
              model,
              middleware: extractReasoningMiddleware({ tagName: reasoningTagName }),
            })
          : model;
    });
  }

  // OpenAI models
  if (env.OPENAI_API_KEY) {
    const openaiModels = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

    openaiModels.forEach(modelId => {
      languageModels[modelId] = openai(modelId);
    });
  }

  // Google models
  if (env.GOOGLE_AI_API_KEY) {
    const googleModels = ['gemini-1.5-pro-latest', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];

    googleModels.forEach(modelId => {
      languageModels[modelId] = google(modelId);
    });
  }

  // Perplexity models
  if (env.PERPLEXITY_API_KEY) {
    const perplexityModels = [
      'llama-3.1-sonar-small-128k-online',
      'llama-3.1-sonar-large-128k-online',
      'llama-3.1-sonar-huge-128k-online',
    ];

    perplexityModels.forEach(modelId => {
      languageModels[`perplexity-${modelId}`] = perplexity(modelId);
    });
  }

  // DeepInfra models
  if (enableDeepInfra && env.DEEP_INFRA_API_KEY) {
    // Add popular DeepInfra models using our helper
    const deepInfraModels = [
      'meta-llama/Meta-Llama-3.1-405B-Instruct',
      'meta-llama/Meta-Llama-3.1-70B-Instruct',
      'meta-llama/Meta-Llama-3.1-8B-Instruct',
      'deepseek-ai/DeepSeek-V3',
    ];

    deepInfraModels.forEach(modelId => {
      languageModels[`deepinfra:${modelId}`] = createDeepInfraModel({
        model: modelId,
        apiKey: env.DEEP_INFRA_API_KEY,
      });
    });
  }

  // Local model providers (OpenAI-compatible)
  if (enableLocalModels) {
    // LM Studio
    if (enableLMStudio && rawEnv.LM_STUDIO_BASE_URL) {
      const lmStudioProvider = createOpenAI({
        baseURL: rawEnv.LM_STUDIO_BASE_URL,
        apiKey: rawEnv.LM_STUDIO_API_KEY || 'lm-studio',
      });

      // Use configured model names or defaults
      const lmStudioModels = {
        'lmstudio-chat': rawEnv.LM_STUDIO_CHAT_MODEL || 'local-model',
        'lmstudio-code': rawEnv.LM_STUDIO_CODE_MODEL || 'local-model',
        'lmstudio-reasoning': rawEnv.LM_STUDIO_REASONING_MODEL || 'local-model',
      };

      Object.entries(lmStudioModels).forEach(([alias, modelId]) => {
        const model = lmStudioProvider(modelId);
        languageModels[alias] =
          enableReasoning && alias.includes('reasoning')
            ? wrapLanguageModel({
                model,
                middleware: extractReasoningMiddleware({ tagName: reasoningTagName }),
              })
            : model;
      });
    }

    // Ollama
    if (enableOllama && rawEnv.OLLAMA_BASE_URL) {
      const ollamaProvider = createOpenAI({
        baseURL: rawEnv.OLLAMA_BASE_URL,
        apiKey: rawEnv.OLLAMA_API_KEY || 'ollama',
      });

      const ollamaModels = {
        'ollama-chat': rawEnv.OLLAMA_CHAT_MODEL || 'llama2',
        'ollama-code': rawEnv.OLLAMA_CODE_MODEL || 'codellama',
        'ollama-reasoning': rawEnv.OLLAMA_REASONING_MODEL || 'llama2',
      };

      Object.entries(ollamaModels).forEach(([alias, modelId]) => {
        const model = ollamaProvider(modelId);
        languageModels[alias] =
          enableReasoning && alias.includes('reasoning')
            ? wrapLanguageModel({
                model,
                middleware: extractReasoningMiddleware({ tagName: reasoningTagName }),
              })
            : model;
      });
    }

    // DeepSeek
    if (enableDeepSeek && process.env.DEEPSEEK_API_KEY) {
      const deepSeekProvider = createOpenAI({
        baseURL: 'https://api.deepseek.com/v1',
        apiKey: process.env.DEEPSEEK_API_KEY,
      });

      const deepSeekModels = {
        'deepseek-chat': process.env.DEEPSEEK_CHAT_MODEL || 'deepseek-chat',
        'deepseek-reasoning': process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-reasoner',
        'deepseek-coder': process.env.DEEPSEEK_CODER_MODEL || 'deepseek-coder',
      };

      Object.entries(deepSeekModels).forEach(([alias, modelId]) => {
        const model = deepSeekProvider(modelId);
        languageModels[alias] =
          enableReasoning && alias.includes('reasoning')
            ? wrapLanguageModel({
                model,
                middleware: extractReasoningMiddleware({ tagName: reasoningTagName }),
              })
            : model;
      });
    }
  }

  return customProvider({
    languageModels,
  });
}
