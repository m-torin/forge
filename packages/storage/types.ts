export interface ListOptions {
  cursor?: string;
  limit?: number;
  prefix?: string;
}

export interface R2Credentials {
  accessKeyId: string;
  accountId: string;
  bucket: string;
  secretAccessKey: string;
  name?: string;
}

export interface EnhancedR2Credentials extends R2Credentials {
  customDomain?: string;
  defaultPartSize?: number;
  defaultQueueSize?: number;
}

export interface StorageConfig {
  cloudflareR2?: EnhancedR2Credentials | EnhancedR2Credentials[];
  cloudflareImages?: {
    accountId: string;
    apiToken: string;
    signingKey?: string;
    deliveryUrl?: string;
  };
  provider: StorageProviderType;
  vercelBlob?: {
    token: string;
  };
}

export interface MultiStorageConfig {
  providers: {
    [key: string]: StorageConfig;
  };
  defaultProvider?: string;
  routing?: {
    images?: string;
    documents?: string;
    [key: string]: string | undefined;
  };
}

export interface StorageObject {
  contentType?: string;
  etag?: string;
  key: string;
  lastModified?: Date;
  size: number;
  url: string;
  metadata?: Record<string, any>;
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
    data: ArrayBuffer | Blob | Buffer | File | ReadableStream,
    options?: UploadOptions,
  ): Promise<StorageObject>;
}

export type StorageProviderType = 'cloudflare-r2' | 'cloudflare-images' | 'vercel-blob' | 'multi';

export interface UploadOptions {
  cacheControl?: number;
  contentType?: string;
  metadata?: Record<string, string>;
  public?: boolean;
  // Cloudflare Images specific options
  requireSignedURLs?: boolean;
  variants?: string[];
  id?: string;
  fileName?: string;
  expiresAfter?: string;
  // Advanced upload options
  partSize?: number;
  queueSize?: number;
  leavePartsOnError?: boolean;
  onProgress?: (progress: UploadProgress) => void;
  // Provider override
  provider?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  part?: number;
  key: string;
}

export interface StreamUploadOptions extends UploadOptions {
  highWaterMark?: number;
}

export interface MultipartUploadResult extends StorageObject {
  uploadId?: string;
  etag?: string;
}

export interface CloudflareImagesVariant {
  id: string;
  options: {
    fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'avif' | 'webp' | 'json' | 'jpeg' | 'png';
    metadata?: 'keep' | 'copyright' | 'none';
    background?: string;
    rotate?: 0 | 90 | 180 | 270 | 360;
    sharpen?: number;
    blur?: number;
    brightness?: number;
    contrast?: number;
    gamma?: number;
    gravity?: 'auto' | 'left' | 'right' | 'top' | 'bottom' | 'center' | { x?: number; y?: number };
    border?: { color?: string; width?: number };
    compression?: 'fast' | 'balanced' | 'best';
    dpr?: number;
    onerror?: 'redirect';
    trim?: { top?: number; right?: number; bottom?: number; left?: number };
    anim?: boolean;
  };
  neverRequireSignedURLs?: boolean;
}

export interface DirectUploadResponse {
  uploadURL: string;
  id: string;
}

export interface CloudflareImagesBatchToken {
  token: string;
  expiresAt: string;
}

export interface CloudflareImagesSigningKey {
  name: string;
  value: string;
}

export interface CloudflareImagesListOptions extends ListOptions {
  perPage?: number;
  page?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface CloudflareImagesStats {
  count: {
    current: number;
    allowed: number;
  };
}

export interface CloudflareImagesTransformOptions {
  width?: number;
  height?: number;
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  gravity?: 'auto' | 'left' | 'right' | 'top' | 'bottom' | 'center' | { x?: number; y?: number };
  quality?: number;
  format?: 'auto' | 'avif' | 'webp' | 'json' | 'jpeg' | 'png';
  anim?: boolean;
  background?: string;
  blur?: number;
  border?: { color?: string; width?: number };
  brightness?: number;
  compression?: 'fast' | 'balanced' | 'best';
  contrast?: number;
  dpr?: number;
  gamma?: number;
  metadata?: 'keep' | 'copyright' | 'none';
  onerror?: 'redirect';
  rotate?: 0 | 90 | 180 | 270 | 360;
  sharpen?: number;
  trim?: { top?: number; right?: number; bottom?: number; left?: number };
}

// Server action response types
export interface MediaActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BulkDeleteResponse {
  succeeded: string[];
  failed: Array<{ key: string; error: string }>;
}

export interface BulkMoveResponse {
  succeeded: Array<{ sourceKey: string; destinationKey: string }>;
  failed: Array<{ sourceKey: string; destinationKey: string; error: string }>;
}
