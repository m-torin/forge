import {
  convertToManagerConfig,
  createConfigFromEnv,
  validateConfig,
} from '../shared/utils/config';
import { AIManager } from '../shared/utils/manager';

import {
  createAnthropicAISdkProvider,
  createGoogleAISdkProvider,
  createOpenAIAISdkProvider,
} from './providers/ai-sdk-provider';
import { createDirectAnthropicProvider } from './providers/direct-anthropic';
import { createDirectOpenAIProvider } from './providers/direct-openai';

import { AIManagerConfig } from '../shared/types';

export class ServerAIManager extends AIManager {
  constructor(config?: AIManagerConfig) {
    super(config);
  }

  static async fromEnv(): Promise<ServerAIManager> {
    const config = createConfigFromEnv();

    // Validate configuration
    const errors = validateConfig(config);
    if (errors.length > 0) {
      throw new Error(
        `Configuration validation failed:\n${errors.map((e: any) => `  - ${e}`).join('\n')}`,
      );
    }

    const managerConfig = convertToManagerConfig(config);
    const manager = new ServerAIManager(managerConfig);

    let registeredCount = 0;

    // Register direct providers
    const directAnthropic = createDirectAnthropicProvider();
    if (directAnthropic && manager.registerProvider(directAnthropic)) {
      registeredCount++;
    }

    const directOpenAI = createDirectOpenAIProvider();
    if (directOpenAI && manager.registerProvider(directOpenAI)) {
      registeredCount++;
    }

    // Register AI SDK providers
    try {
      if (config.providers?.openai?.apiKey) {
        const openaiProvider = createOpenAIAISdkProvider();
        if (manager.registerProvider(openaiProvider)) {
          registeredCount++;
        }
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('Failed to register OpenAI AI SDK provider: ', error);
    }

    try {
      if (config.providers?.anthropic?.apiKey) {
        const anthropicProvider = createAnthropicAISdkProvider();
        if (manager.registerProvider(anthropicProvider)) {
          registeredCount++;
        }
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('Failed to register Anthropic AI SDK provider: ', error);
    }

    try {
      if (config.providers?.google?.apiKey) {
        const googleProvider = createGoogleAISdkProvider();
        if (manager.registerProvider(googleProvider)) {
          registeredCount++;
        }
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('Failed to register Google AI SDK provider: ', error);
    }

    if (registeredCount === 0) {
      throw new Error(
        'No AI providers were successfully registered. Please check your API keys and configuration.',
      );
    }

    // eslint-disable-next-line no-console
    console.log(`AI Manager initialized with ${registeredCount} provider(s)`);
    return manager;
  }

  // Convenience methods for common operations
  async classifyProduct(product: any): Promise<any> {
    const provider = this.getProviderForCapability('classify');
    if (!provider?.classify) {
      throw new Error('No classification provider available');
    }
    return provider.classify(JSON.stringify(product));
  }

  async moderateContent(content: string): Promise<any> {
    const provider = this.getProviderForCapability('moderate');
    if (!provider?.moderate) {
      throw new Error('No moderation provider available');
    }
    return provider.moderate(content);
  }
}
