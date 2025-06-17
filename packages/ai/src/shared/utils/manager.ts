import { ProviderRegistry } from '../providers/registry';

import {
  AIManagerConfig,
  AIProvider,
  Capability,
  ClassificationResult,
  CompletionOptions,
  CompletionResponse,
  EntityResult,
  ModerationResult,
  SentimentResult,
  StreamChunk,
  StreamOptions,
} from '../types';

export class AIManager {
  protected defaultProvider?: string;
  protected registry = new ProviderRegistry();
  protected routing = new Map<Capability, string>();

  constructor(config?: AIManagerConfig) {
    if (config) {
      this.configure(config);
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const provider = this.getProviderForCapability('sentiment');
    if (!provider?.analyzeSentiment) {
      throw new Error('No provider available for sentiment analysis');
    }
    return provider.analyzeSentiment(text);
  }

  async classify(text: string, labels?: string[]): Promise<ClassificationResult> {
    const provider = this.getProviderForCapability('classify');
    if (!provider?.classify) {
      throw new Error('No provider available for classification');
    }
    return provider.classify(text, labels);
  }

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    const provider = this.getProviderForCapability('complete');
    if (!provider) {
      throw new Error('No provider available for completion');
    }
    return provider.complete(options);
  }

  configure(config: AIManagerConfig): void {
    if (config.defaultProvider) {
      this.defaultProvider = config.defaultProvider;
    }

    if (config.routing) {
      for (const [capability, providerName] of Object.entries(config.routing)) {
        this.routing.set(capability as Capability, providerName);
      }
    }
  }

  async extractEntities(text: string): Promise<EntityResult> {
    const provider = this.getProviderForCapability('extraction');
    if (!provider?.extractEntities) {
      throw new Error('No provider available for entity extraction');
    }
    return provider.extractEntities(text);
  }

  getAvailableCapabilities(): Capability[] {
    const capabilities = new Set<Capability>();
    for (const provider of this.registry.getAll()) {
      for (const capability of provider.capabilities) {
        capabilities.add(capability);
      }
    }
    return Array.from(capabilities);
  }

  getProvider(name: string): AIProvider | undefined {
    return this.registry.get(name);
  }

  getProviderForCapability(capability: Capability): AIProvider | undefined {
    const routedProvider = this.routing.get(capability);
    if (routedProvider) {
      const provider = this.registry.get(routedProvider);
      if (provider?.capabilities.has(capability)) {
        return provider;
      }
    }

    const capableProviders = this.registry.getByCapability(capability);
    if (capableProviders.length > 0) {
      return capableProviders[0];
    }

    if (this.defaultProvider) {
      const provider = this.registry.get(this.defaultProvider);
      if (provider?.capabilities.has(capability)) {
        return provider;
      }
    }

    return undefined;
  }

  getProviderStatus(): {
    available: boolean;
    capabilities: Capability[];
    name: string;
    type: string;
  }[] {
    return this.registry.getAll().map((provider: any) => ({
      available: true,
      capabilities: Array.from(provider.capabilities),
      name: provider.name,
      type: provider.type,
    }));
  }

  async moderate(content: string): Promise<ModerationResult> {
    const provider = this.getProviderForCapability('moderate');
    if (!provider?.moderate) {
      throw new Error('No provider available for moderation');
    }
    return provider.moderate(content);
  }

  registerProvider(provider: AIProvider): boolean {
    try {
      this.registry.register(provider);
      return true;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to register provider "${provider.name}":`, error);
      return false;
    }
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    const provider = this.getProviderForCapability('stream');
    if (!provider) {
      throw new Error('No provider available for streaming');
    }
    yield* provider.stream(options);
  }
}
