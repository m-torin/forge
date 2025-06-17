import { AIProvider, Capability } from '../types';

export class ProviderRegistry {
  private capabilityMap = new Map<Capability, Set<string>>();
  private providers = new Map<string, AIProvider>();

  clear(): void {
    this.providers.clear();
    this.capabilityMap.clear();
  }

  get(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getByCapability(capability: Capability): AIProvider[] {
    const providerNames = this.capabilityMap.get(capability) ?? new Set();
    return Array.from(providerNames)
      .map((name: any) => this.providers.get(name))
      .filter((provider): provider is AIProvider => provider !== undefined);
  }

  hasCapability(providerName: string, capability: Capability): boolean {
    const provider = this.providers.get(providerName);
    return provider?.capabilities.has(capability) ?? false;
  }

  register(provider: AIProvider): void {
    // Validate provider before registration
    this.validateProvider(provider);

    this.providers.set(provider.name, provider);

    for (const capability of provider.capabilities) {
      const providers = this.capabilityMap.get(capability) ?? new Set();
      providers.add(provider.name);
      this.capabilityMap.set(capability, providers);
    }
  }

  remove(name: string): boolean {
    const provider = this.providers.get(name);
    if (!provider) return false;

    this.providers.delete(name);

    for (const capability of provider.capabilities) {
      const providers = this.capabilityMap.get(capability);
      if (providers) {
        providers.delete(name);
        if (providers.size === 0) {
          this.capabilityMap.delete(capability);
        }
      }
    }

    return true;
  }

  private validateProvider(provider: AIProvider): void {
    if (!provider.name || typeof provider.name !== 'string') {
      throw new Error('Provider must have a valid name');
    }

    if (!['ai-sdk', 'custom', 'direct'].includes(provider.type)) {
      throw new Error(`Provider "${provider.name}" has invalid type: ${provider.type}`);
    }

    if (provider.capabilities.size === 0) {
      throw new Error(`Provider "${provider.name}" must declare at least one capability`);
    }

    // Validate that provider implements required methods for its capabilities
    this.validateProviderMethods(provider);
  }

  private validateProviderMethods(provider: AIProvider): void {
    const missingMethods: string[] = [];

    if (provider.capabilities.has('complete') && typeof provider.complete !== 'function') {
      missingMethods.push('complete');
    }

    if (provider.capabilities.has('stream') && typeof provider.stream !== 'function') {
      missingMethods.push('stream');
    }

    if (provider.capabilities.has('embed') && typeof provider.embed !== 'function') {
      missingMethods.push('embed');
    }

    if (
      provider.capabilities.has('generateObject') &&
      typeof provider.generateObject !== 'function'
    ) {
      missingMethods.push('generateObject');
    }

    if (provider.capabilities.has('moderate') && typeof provider.moderate !== 'function') {
      missingMethods.push('moderate');
    }

    if (provider.capabilities.has('classify') && typeof provider.classify !== 'function') {
      missingMethods.push('classify');
    }

    if (provider.capabilities.has('sentiment') && typeof provider.analyzeSentiment !== 'function') {
      missingMethods.push('analyzeSentiment');
    }

    if (provider.capabilities.has('extraction') && typeof provider.extractEntities !== 'function') {
      missingMethods.push('extractEntities');
    }

    if (missingMethods.length > 0) {
      throw new Error(
        `Provider "${provider.name}" claims capabilities but missing methods: ${missingMethods.join(', ')}`,
      );
    }
  }
}
