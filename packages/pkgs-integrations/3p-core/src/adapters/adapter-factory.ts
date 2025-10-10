/**
 * Adapter factory for 3rd party analytics integrations
 */

import type {
  BaseProviderConfig,
  BatchingConfig,
  PrivacyConfig,
  ProviderAdapter,
  ProviderType,
  RetryConfig,
} from '../types';

export interface AdapterFactoryOptions {
  batchingConfig?: BatchingConfig;
  privacyConfig?: PrivacyConfig;
  retryConfig?: RetryConfig;
}

export type AdapterFactory = (
  config: BaseProviderConfig,
  options?: AdapterFactoryOptions,
) => Promise<ProviderAdapter>;

export class AdapterRegistry {
  private static factories = new Map<ProviderType, AdapterFactory>();

  static register(provider: ProviderType, factory: AdapterFactory): void {
    this.factories.set(provider, factory);
  }

  static async create(
    config: BaseProviderConfig,
    options?: AdapterFactoryOptions,
  ): Promise<ProviderAdapter> {
    const factory = this.factories.get(config.provider);
    if (!factory) {
      throw new Error(`No adapter factory registered for provider: ${config.provider}`);
    }

    return factory(config, options);
  }

  static getRegisteredProviders(): ProviderType[] {
    return Array.from(this.factories.keys());
  }

  static isProviderSupported(provider: ProviderType): boolean {
    return this.factories.has(provider);
  }
}

export async function createAdapter(
  config: BaseProviderConfig,
  options?: AdapterFactoryOptions,
): Promise<ProviderAdapter> {
  return AdapterRegistry.create(config, options);
}

export function registerAdapter(provider: ProviderType, factory: AdapterFactory): void {
  AdapterRegistry.register(provider, factory);
}

export class MultiProviderManager {
  private adapters = new Map<string, ProviderAdapter>();
  private defaultOptions?: AdapterFactoryOptions;

  constructor(defaultOptions?: AdapterFactoryOptions) {
    this.defaultOptions = defaultOptions;
  }

  async addProvider(
    key: string,
    config: BaseProviderConfig,
    options?: AdapterFactoryOptions,
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const adapter = await createAdapter(config, mergedOptions);

    await adapter.initialize();
    this.adapters.set(key, adapter);
  }

  async removeProvider(key: string): Promise<void> {
    const adapter = this.adapters.get(key);
    if (adapter) {
      await adapter.destroy();
      this.adapters.delete(key);
    }
  }

  getProvider(key: string): ProviderAdapter | undefined {
    return this.adapters.get(key);
  }

  getProviders(): Map<string, ProviderAdapter> {
    return new Map(this.adapters);
  }

  async track(event: any): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    const promises = Array.from(this.adapters.entries()).map(async ([key, adapter]) => {
      try {
        const success = await adapter.track(event);
        results[key] = success;
      } catch (error) {
        console.error(`Failed to track event with ${key}:`, error);
        results[key] = false;
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  async identify(payload: any): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    const promises = Array.from(this.adapters.entries()).map(async ([key, adapter]) => {
      try {
        const success = await adapter.identify(payload);
        results[key] = success;
      } catch (error) {
        console.error(`Failed to identify with ${key}:`, error);
        results[key] = false;
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  async group(payload: any): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    const promises = Array.from(this.adapters.entries()).map(async ([key, adapter]) => {
      try {
        const success = await adapter.group(payload);
        results[key] = success;
      } catch (error) {
        console.error(`Failed to group with ${key}:`, error);
        results[key] = false;
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  async page(payload: any): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    const promises = Array.from(this.adapters.entries()).map(async ([key, adapter]) => {
      try {
        const success = await adapter.page(payload);
        results[key] = success;
      } catch (error) {
        console.error(`Failed to track page with ${key}:`, error);
        results[key] = false;
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  async flush(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    const promises = Array.from(this.adapters.entries()).map(async ([key, adapter]) => {
      try {
        const success = await adapter.flush();
        results[key] = success;
      } catch (error) {
        console.error(`Failed to flush ${key}:`, error);
        results[key] = false;
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  async destroy(): Promise<void> {
    const promises = Array.from(this.adapters.values()).map(adapter =>
      adapter.destroy().catch(error => console.error('Failed to destroy adapter:', error)),
    );

    await Promise.allSettled(promises);
    this.adapters.clear();
  }
}

export function createMultiProviderManager(
  defaultOptions?: AdapterFactoryOptions,
): MultiProviderManager {
  return new MultiProviderManager(defaultOptions);
}
