export interface StorageObject {
  contentType?: string;
  etag?: string;
  key: string;
  lastModified?: Date;
  size: number;
  url: string;
}

export interface UploadOptions {
  cacheControl?: number; // in seconds
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
}

export interface ListOptions {
  cursor?: string;
  limit?: number;
  prefix?: string;
}

export interface StorageProvider {
  delete(key: string): Promise<void>;
  download(key: string): Promise<Blob>;
  exists(key: string): Promise<boolean>;
  getMetadata(key: string): Promise<StorageObject>;
  getUrl(key: string, options?: { expiresIn?: number }): Promise<string>;
  list(options?: ListOptions): Promise<StorageObject[]>;
  upload(
    key: string,
    data: Buffer | Blob | File | ArrayBuffer | ReadableStream,
    options?: UploadOptions,
  ): Promise<StorageObject>;
}

export type StorageProviderType = 'vercel-blob' | 'cloudflare-r2';

export interface StorageConfig {
  cloudflareR2?: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
  };
  provider: StorageProviderType;
  vercelBlob?: {
    token: string;
  };
}
