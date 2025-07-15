/**
 * Server-side storage exports (non-Next.js)
 *
 * This file provides server-side storage functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/storage/server/next' instead.
 */

import { safeEnv } from '../env';
import { CloudflareImagesProvider } from '../providers/cloudflare-images';
import { CloudflareR2Provider } from '../providers/cloudflare-r2';
import { VercelBlobProvider } from '../providers/vercel-blob';
import { MultiStorageManager } from './multi-storage';

import {
  ListOptions,
  MultiStorageConfig,
  StorageConfig,
  StorageObject,
  StorageProvider,
  StorageProviderType,
  UploadOptions,
} from '../types';

export { env, safeEnv } from '../env';
export { CloudflareImagesProvider } from '../providers/cloudflare-images';
export { CloudflareR2Provider } from '../providers/cloudflare-r2';
export * from '../types';
export { MultiStorageManager } from './multi-storage';

// Factory function to create storage provider
export function createStorageProvider(config: StorageConfig): StorageProvider {
  switch (config.provider) {
    case 'cloudflare-r2':
      if (!config.cloudflareR2) {
        throw new Error('Cloudflare R2 configuration is required');
      }
      // Support single R2 config
      if (!Array.isArray(config.cloudflareR2)) {
        return new CloudflareR2Provider(config.cloudflareR2);
      }
      // For array, use first one (backward compatibility)
      if (config.cloudflareR2.length === 0) {
        throw new Error('No R2 configurations provided');
      }
      return new CloudflareR2Provider(config.cloudflareR2[0]);

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

// Singleton storage instance
let storageInstance: MultiStorageManager | null | StorageProvider = null;
let hasLoggedWarning = false;
let multiStorageInstance: MultiStorageManager | null = null;

// Test helper to reset singleton state
export function resetStorageState(): void {
  storageInstance = null;
  multiStorageInstance = null;
  hasLoggedWarning = false;
}

// Mock storage provider for development
class MockStorageProvider implements StorageProvider {
  private storage = new Map<string, { data: any; metadata: StorageObject }>();

  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async download(_key: string): Promise<Blob> {
    return new Blob(['mock data'], { type: 'text/plain' });
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async getMetadata(key: string): Promise<StorageObject> {
    const item = this.storage.get(key);
    if (!item) {
      throw new Error(`Object with key ${key} not found`);
    }
    return item.metadata;
  }

  async getUrl(key: string, _options?: { expiresIn?: number }): Promise<string> {
    return `https://mock-storage.example.com/${key}`;
  }

  async list(_options?: ListOptions): Promise<StorageObject[]> {
    return Array.from(this.storage.values()).map((item: any) => item.metadata);
  }

  async upload(
    key: string,
    data: ArrayBuffer | Blob | Buffer | File | ReadableStream,
    options?: UploadOptions,
  ): Promise<StorageObject> {
    const mockObject: StorageObject = {
      contentType: options?.contentType ?? 'application/octet-stream',
      key,
      lastModified: new Date(),
      size: data instanceof Buffer ? data.length : 1024,
      url: `https://mock-storage.example.com/${key}`,
    };
    this.storage.set(key, { data, metadata: mockObject });
    return mockObject;
  }
}

// Get storage instance (lazy initialization)
export function getStorage(): StorageProvider {
  if (!storageInstance) {
    return initializeStorage();
  }
  return storageInstance;
}

// Initialize storage with environment variables
export function initializeStorage(): StorageProvider {
  if (storageInstance) {
    return storageInstance;
  }

  const env = safeEnv();
  const provider = env.STORAGE_PROVIDER;

  // Return mock provider if no provider is configured
  if (!provider) {
    if (!hasLoggedWarning) {
      // Storage service runs in mock mode when not configured
      hasLoggedWarning = true;
    }
    storageInstance = new MockStorageProvider();
    return storageInstance;
  }

  const config: StorageConfig = {
    provider: provider as StorageProviderType,
  };

  // Configure based on provider
  switch (provider) {
    case 'cloudflare-r2': {
      if (
        !env.R2_ACCOUNT_ID ||
        !env.R2_ACCESS_KEY_ID ||
        !env.R2_SECRET_ACCESS_KEY ||
        !env.R2_BUCKET
      ) {
        throw new Error('R2 configuration is incomplete');
      }
      config.cloudflareR2 = {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        accountId: env.R2_ACCOUNT_ID,
        bucket: env.R2_BUCKET,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      };
      break;
    }
    case 'vercel-blob': {
      if (!env.BLOB_READ_WRITE_TOKEN) {
        throw new Error('BLOB_READ_WRITE_TOKEN is required for Vercel Blob provider');
      }
      config.vercelBlob = {
        token: env.BLOB_READ_WRITE_TOKEN,
      };
      break;
    }
  }

  storageInstance = createStorageProvider(config);
  return storageInstance;
}

// Initialize multi-storage with environment variables
export function initializeMultiStorage(): MultiStorageManager {
  if (multiStorageInstance) {
    return multiStorageInstance;
  }

  const env = safeEnv();

  // Check if we have a full storage config JSON
  if (env.STORAGE_CONFIG) {
    const config =
      typeof env.STORAGE_CONFIG === 'string' ? JSON.parse(env.STORAGE_CONFIG) : env.STORAGE_CONFIG;
    multiStorageInstance = new MultiStorageManager(config);
    return multiStorageInstance;
  }

  // Build config from individual env vars
  const config: MultiStorageConfig = {
    providers: {},
  };

  // Add R2 providers from JSON array
  if (env.R2_CREDENTIALS && Array.isArray(env.R2_CREDENTIALS)) {
    const r2Configs = env.R2_CREDENTIALS;
    r2Configs.forEach((r2Config: any, index: number) => {
      const name = r2Config.name || `r2-${index}`;
      config.providers[name] = {
        provider: 'cloudflare-r2',
        cloudflareR2: r2Config,
      };
    });
  }

  // Add legacy R2 config if present
  if (env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET && env.R2_ACCOUNT_ID) {
    config.providers['r2-legacy'] = {
      provider: 'cloudflare-r2',
      cloudflareR2: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        accountId: env.R2_ACCOUNT_ID,
        bucket: env.R2_BUCKET,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    };
  }

  // Add Cloudflare Images if configured
  if (env.CLOUDFLARE_IMAGES_API_TOKEN && env.CLOUDFLARE_IMAGES_ACCOUNT_ID) {
    config.providers['images'] = {
      provider: 'cloudflare-images',
      cloudflareImages: {
        accountId: env.CLOUDFLARE_IMAGES_ACCOUNT_ID,
        apiToken: env.CLOUDFLARE_IMAGES_API_TOKEN,
        deliveryUrl: env.CLOUDFLARE_IMAGES_DELIVERY_URL,
        signingKey: env.CLOUDFLARE_IMAGES_SIGNING_KEY,
      },
    };
  }

  // Add Vercel Blob if configured
  if (env.BLOB_READ_WRITE_TOKEN) {
    config.providers['blob'] = {
      provider: 'vercel-blob',
      vercelBlob: {
        token: env.BLOB_READ_WRITE_TOKEN,
      },
    };
  }

  // Set up routing
  config.routing = {
    images: 'images', // Route image files to Cloudflare Images if available
    documents: config.providers['r2-0'] ? 'r2-0' : 'r2-legacy', // Route documents to first R2
  };

  if (Object.keys(config.providers).length === 0) {
    // Return mock multi-storage
    config.providers['mock'] = {
      provider: 'vercel-blob', // Using mock provider
      vercelBlob: { token: 'mock' },
    };
    multiStorageInstance = new MultiStorageManager(config);

    if (!hasLoggedWarning) {
      // Multi-storage service runs in mock mode when not configured
      hasLoggedWarning = true;
    }
    return multiStorageInstance;
  }

  multiStorageInstance = new MultiStorageManager(config);
  return multiStorageInstance;
}

// Get multi-storage instance
export function getMultiStorage(): MultiStorageManager {
  if (!multiStorageInstance) {
    return initializeMultiStorage();
  }
  return multiStorageInstance;
}

// Helper functions for common operations
export const storage = {
  delete: (key: string) => getStorage().delete(key),
  download: (key: string) => getStorage().download(key),
  exists: (key: string) => getStorage().exists(key),
  getMetadata: (key: string) => getStorage().getMetadata(key),
  getUrl: (key: string, options?: any) => getStorage().getUrl(key, options),
  list: (options?: any) => getStorage().list(options),
  upload: (key: string, data: any, options?: any) => getStorage().upload(key, data, options),
};

// Multi-storage helper functions
export const multiStorage = {
  delete: (key: string) => getMultiStorage().delete(key),
  download: (key: string) => getMultiStorage().download(key),
  exists: (key: string) => getMultiStorage().exists(key),
  getMetadata: (key: string) => getMultiStorage().getMetadata(key),
  getProvider: (name: string) => getMultiStorage().getProvider(name),
  getProviderNames: () => getMultiStorage().getProviderNames(),
  getUrl: (key: string, options?: any) => getMultiStorage().getUrl(key, options),
  list: (options?: any) => getMultiStorage().list(options),
  upload: (key: string, data: any, options?: any) => getMultiStorage().upload(key, data, options),
};
