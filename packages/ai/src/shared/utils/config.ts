import { aiKeys } from '../../../keys';

import type { AIConfig } from '../types/config';
import type { AIManagerConfig, ProviderConfig } from '../types/provider';

export function createConfigFromEnv(): AIConfig {
  return {
    defaultProvider: 'openai',
    providers: {
      anthropic: {
        apiKey: aiKeys.ANTHROPIC_API_KEY,
      },
      google: {
        apiKey: aiKeys.GOOGLE_AI_API_KEY,
      },
      openai: {
        apiKey: aiKeys.OPENAI_API_KEY,
      },
    },
    enableLogging: process.env.NODE_ENV === 'development',
    enableRateLimit: process.env.NODE_ENV === 'production',
  };
}

export function validateConfig(config: AIConfig): string[] {
  const errors: string[] = [];

  if (!config.providers || Object.keys(config.providers).length === 0) {
    errors.push('At least one provider must be configured');
    return errors;
  }

  // Check that at least one provider has a valid API key
  let hasValidProvider = false;

  if (config.providers.openai?.apiKey) {
    hasValidProvider = true;
  } else if (config.providers.openai) {
    errors.push('OpenAI provider configured but missing API key');
  }

  if (config.providers.anthropic?.apiKey) {
    hasValidProvider = true;
  } else if (config.providers.anthropic) {
    errors.push('Anthropic provider configured but missing API key');
  }

  if (config.providers.google?.apiKey) {
    hasValidProvider = true;
  } else if (config.providers.google) {
    errors.push('Google provider configured but missing API key');
  }

  if (!hasValidProvider) {
    errors.push('No provider has a valid API key. At least one provider must have an API key.');
  }

  return errors;
}

export function convertToManagerConfig(config: AIConfig): AIManagerConfig {
  const providers: ProviderConfig[] = [];

  // Convert AIConfig providers to ProviderConfig array
  if (config.providers?.openai?.apiKey) {
    providers.push({
      name: 'openai-direct',
      type: 'direct',
      config: config.providers.openai,
    });
  }

  if (config.providers?.anthropic?.apiKey) {
    providers.push({
      name: 'anthropic-direct',
      type: 'direct',
      config: config.providers.anthropic,
    });
  }

  if (config.providers?.google?.apiKey) {
    providers.push({
      name: 'google-ai-sdk',
      type: 'ai-sdk',
      config: config.providers.google,
    });
  }

  return {
    defaultProvider: config.defaultProvider,
    providers,
    enableLogging: config.enableLogging,
    enableRateLimit: config.enableRateLimit,
  };
}
