import { CloudflareImagesProvider } from '../providers/cloudflare-images';
import { CloudflareR2Provider } from '../providers/cloudflare-r2';
import { VercelBlobProvider } from '../providers/vercel-blob';
import {
  ListOptions,
  MultiStorageConfig,
  StorageConfig,
  StorageObject,
  StorageProvider,
  UploadOptions,
} from '../types';

export class MultiStorageManager {
  private providers: Map<string, StorageProvider> = new Map();
  private defaultProvider: string;
  private routing: MultiStorageConfig['routing'];

  constructor(config: MultiStorageConfig) {
    // Initialize all providers
    for (const [name, providerConfig] of Object.entries(config.providers)) {
      this.providers.set(name, this.createProvider(providerConfig));
    }

    // Set default provider
    this.defaultProvider = config.defaultProvider || Object.keys(config.providers)[0];
    if (!this.defaultProvider) {
      throw new Error('No storage providers configured');
    }

    this.routing = config.routing;
  }

  private createProvider(config: StorageConfig): StorageProvider {
    switch (config.provider) {
      case 'cloudflare-r2':
        if (!config.cloudflareR2) {
          throw new Error('Cloudflare R2 configuration is required');
        }
        // Handle array of R2 configs
        if (Array.isArray(config.cloudflareR2)) {
          if (config.cloudflareR2.length === 0) {
            throw new Error('No R2 configurations provided');
          }
          // Use first one for single provider (backward compatibility)
          return new CloudflareR2Provider(config.cloudflareR2[0]);
        }
        return new CloudflareR2Provider(config.cloudflareR2);

      case 'cloudflare-images':
        if (!config.cloudflareImages) {
          throw new Error('Cloudflare Images configuration is required');
        }
        return new CloudflareImagesProvider(config.cloudflareImages);

      case 'vercel-blob':
        if (!config.vercelBlob?.token) {
          throw new Error('Vercel Blob token is required');
        }
        return new VercelBlobProvider(config.vercelBlob.token);

      default:
        throw new Error(`Unknown storage provider: ${config.provider}`);
    }
  }

  private getProviderForKey(key: string): { provider: StorageProvider; providerName: string } {
    // Check routing rules
    if (this.routing) {
      // Check file type routing
      const extension = key.split('.').pop()?.toLowerCase();

      // Image routing
      if (this.routing.images && this.isImageFile(extension)) {
        const provider = this.providers.get(this.routing.images);
        if (provider) {
          return { provider, providerName: this.routing.images };
        }
      }

      // Document routing
      if (this.routing.documents && this.isDocumentFile(extension)) {
        const provider = this.providers.get(this.routing.documents);
        if (provider) {
          return { provider, providerName: this.routing.documents };
        }
      }

      // Custom routing rules
      for (const [pattern, providerName] of Object.entries(this.routing)) {
        if (pattern !== 'images' && pattern !== 'documents' && providerName) {
          // Simple pattern matching (could be enhanced with regex)
          if (key.includes(pattern)) {
            const provider = this.providers.get(providerName);
            if (provider) {
              return { provider, providerName };
            }
          }
        }
      }
    }

    // Fall back to default provider
    const provider = this.providers.get(this.defaultProvider);
    if (!provider) {
      throw new Error(`Default provider '${this.defaultProvider}' not found`);
    }

    return { provider, providerName: this.defaultProvider };
  }

  private isImageFile(extension?: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'ico'];
    return extension ? imageExtensions.includes(extension) : false;
  }

  private isDocumentFile(extension?: string): boolean {
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'];
    return extension ? documentExtensions.includes(extension) : false;
  }

  // Get a specific provider by name
  getProvider(name: string): StorageProvider | undefined {
    return this.providers.get(name);
  }

  // Storage operations that route to appropriate provider
  async delete(key: string): Promise<void> {
    const { provider } = this.getProviderForKey(key);
    return provider.delete(key);
  }

  async download(key: string): Promise<Blob> {
    const { provider } = this.getProviderForKey(key);
    return provider.download(key);
  }

  async exists(key: string): Promise<boolean> {
    const { provider } = this.getProviderForKey(key);
    return provider.exists(key);
  }

  async getMetadata(key: string): Promise<StorageObject> {
    const { provider } = this.getProviderForKey(key);
    return provider.getMetadata(key);
  }

  async getUrl(key: string, options?: { expiresIn?: number }): Promise<string> {
    const { provider } = this.getProviderForKey(key);
    return provider.getUrl(key, options);
  }

  async list(options?: ListOptions & { provider?: string }): Promise<StorageObject[]> {
    // If specific provider requested, use it
    if (options?.provider) {
      const provider = this.providers.get(options.provider);
      if (!provider) {
        throw new Error(`Provider '${options.provider}' not found`);
      }
      return provider.list(options);
    }

    // Otherwise, list from all providers
    const allResults: StorageObject[] = [];
    for (const provider of this.providers.values()) {
      const results = await provider.list(options);
      allResults.push(...results);
    }
    return allResults;
  }

  async upload(
    key: string,
    data: ArrayBuffer | Blob | Buffer | File | ReadableStream,
    options?: UploadOptions & { provider?: string },
  ): Promise<StorageObject> {
    let provider: StorageProvider;

    // If specific provider requested, use it
    if (options?.provider) {
      const requestedProvider = this.providers.get(options.provider);
      if (!requestedProvider) {
        throw new Error(`Provider '${options.provider}' not found`);
      }
      provider = requestedProvider;
    } else {
      // Otherwise, use routing logic
      const result = this.getProviderForKey(key);
      provider = result.provider;
    }

    return provider.upload(key, data, options);
  }

  // Extended methods for Cloudflare Images
  async getCloudflareImagesProvider(): Promise<CloudflareImagesProvider | undefined> {
    for (const provider of this.providers.values()) {
      if (provider instanceof CloudflareImagesProvider) {
        return provider;
      }
    }
    return undefined;
  }

  // Get all provider names
  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }
}
