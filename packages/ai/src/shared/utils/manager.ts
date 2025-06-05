import { ProviderRegistry } from '../providers/registry';

import type {
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
  protected registry = new ProviderRegistry();
  protected routing = new Map<Capability, string>();
  protected defaultProvider?: string;

  constructor(config?: AIManagerConfig) {
    if (config) {
      this.configure(config);
    }
  }

  configure(config: AIManagerConfig): void {
    this.defaultProvider = config.defaultProvider;

    if (config.routing) {
      for (const [capability, providerName] of Object.entries(config.routing)) {
        this.routing.set(capability as Capability, providerName);
      }
    }
  }

  registerProvider(provider: AIProvider): boolean {
    try {
      this.registry.register(provider);
      return true;
    } catch (error) {
      console.warn(`Failed to register provider "${provider.name}":`, error);
      return false;
    }
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

  async complete(options: CompletionOptions): Promise<CompletionResponse> {
    const provider = this.getProviderForCapability('complete');
    if (!provider) {
      throw new Error('No provider available for completion');
    }
    return provider.complete(options);
  }

  async *stream(options: StreamOptions): AsyncIterableIterator<StreamChunk> {
    const provider = this.getProviderForCapability('stream');
    if (!provider) {
      throw new Error('No provider available for streaming');
    }
    yield* provider.stream(options);
  }

  async moderate(content: string): Promise<ModerationResult> {
    const provider = this.getProviderForCapability('moderate');
    if (!provider?.moderate) {
      throw new Error('No provider available for moderation');
    }
    return provider.moderate(content);
  }

  async classify(text: string, labels?: string[]): Promise<ClassificationResult> {
    const provider = this.getProviderForCapability('classify');
    if (!provider?.classify) {
      throw new Error('No provider available for classification');
    }
    return provider.classify(text, labels);
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const provider = this.getProviderForCapability('sentiment');
    if (!provider?.analyzeSentiment) {
      throw new Error('No provider available for sentiment analysis');
    }
    return provider.analyzeSentiment(text);
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

  getProviderStatus(): {
    name: string;
    type: string;
    capabilities: Capability[];
    available: boolean;
  }[] {
    return this.registry.getAll().map((provider) => ({
      name: provider.name,
      type: provider.type,
      available: true,
      capabilities: Array.from(provider.capabilities),
    }));
  }
}
