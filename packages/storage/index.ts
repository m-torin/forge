import { keys } from './keys';
import { CloudflareR2Provider } from './providers/cloudflare-r2';
import { VercelBlobProvider } from './providers/vercel-blob';

import type {
  ListOptions,
  StorageConfig,
  StorageObject,
  StorageProvider,
  UploadOptions,
} from './types';

export * from './types';
export { keys };

// Factory function to create storage provider
export function createStorageProvider(config: StorageConfig): StorageProvider {
  switch (config.provider) {
    case 'vercel-blob':
      if (!config.vercelBlob?.token) {
        throw new Error('Vercel Blob token is required');
      }
      return new VercelBlobProvider(config.vercelBlob.token);

    case 'cloudflare-r2':
      if (!config.cloudflareR2) {
        throw new Error('Cloudflare R2 configuration is required');
      }
      return new CloudflareR2Provider(config.cloudflareR2);

    default:
      throw new Error(`Unknown storage provider: ${config.provider}`);
  }
}

// Singleton storage instance
let storageInstance: StorageProvider | null = null;
let hasLoggedWarning = false;

// Mock storage provider for development
class MockStorageProvider implements StorageProvider {
  private storage = new Map<string, { data: any; metadata: StorageObject }>();

  async upload(
    key: string,
    data: Buffer | Blob | File | ArrayBuffer | ReadableStream,
    options?: UploadOptions,
  ): Promise<StorageObject> {
    const mockObject: StorageObject = {
      url: `https://mock-storage.example.com/${key}`,
      contentType: options?.contentType || 'application/octet-stream',
      key,
      lastModified: new Date(),
      size: data instanceof Buffer ? data.length : 1024,
    };
    this.storage.set(key, { data, metadata: mockObject });
    return mockObject;
  }

  async download(_key: string): Promise<Blob> {
    return new Blob(['mock data'], { type: 'text/plain' });
  }

  async delete(_key: string): Promise<void> {
    this.storage.delete(_key);
  }

  async exists(_key: string): Promise<boolean> {
    return this.storage.has(_key);
  }

  async getUrl(_key: string, _options?: { expiresIn?: number }): Promise<string> {
    return `https://mock-storage.example.com/${_key}`;
  }

  async list(_options?: ListOptions): Promise<StorageObject[]> {
    return Array.from(this.storage.values()).map((item) => item.metadata);
  }

  async getMetadata(_key: string): Promise<StorageObject> {
    const item = this.storage.get(_key);
    if (!item) {
      throw new Error(`Object with key ${_key} not found`);
    }
    return item.metadata;
  }
}

// Initialize storage with environment variables
export function initializeStorage(): StorageProvider {
  if (storageInstance) {
    return storageInstance;
  }

  const env = keys();
  const provider = env.STORAGE_PROVIDER;

  // Return mock provider if no provider is configured
  if (!provider) {
    if (!hasLoggedWarning) {
      console.warn('Storage service is disabled: Missing STORAGE_PROVIDER configuration');
      hasLoggedWarning = true;
    }
    storageInstance = new MockStorageProvider();
    return storageInstance;
  }

  const config: StorageConfig = {
    provider,
  };

  // Configure based on provider
  if (provider === 'vercel-blob') {
    if (!env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is required for Vercel Blob provider');
    }
    config.vercelBlob = {
      token: env.BLOB_READ_WRITE_TOKEN,
    };
  } else if (provider === 'cloudflare-r2') {
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
  }

  storageInstance = createStorageProvider(config);
  return storageInstance;
}

// Get storage instance (lazy initialization)
export function getStorage(): StorageProvider {
  if (!storageInstance) {
    return initializeStorage();
  }
  return storageInstance;
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
