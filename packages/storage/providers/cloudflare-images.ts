import { logError, logWarn } from '@repo/observability/server/next';
import {
  CloudflareImagesBatchToken,
  CloudflareImagesListOptions,
  CloudflareImagesSigningKey,
  CloudflareImagesStats,
  CloudflareImagesTransformOptions,
  CloudflareImagesVariant,
  DirectUploadResponse,
  ListOptions,
  StorageObject,
  StorageProvider,
  UploadOptions,
} from '../types';

interface CloudflareImagesConfig {
  accountId: string;
  apiToken: string;
  deliveryUrl?: string;
  signingKey?: string;
}

interface CloudflareImagesResponse<T = any> {
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result: T;
  success: boolean;
}

interface CloudflareImage {
  filename: string;
  id: string;
  meta?: Record<string, any>;
  requireSignedURLs: boolean;
  uploaded: string;
  variants: string[];
}

export class CloudflareImagesProvider implements StorageProvider {
  private accountId: string;
  private apiToken: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';
  private deliveryUrl: string;
  private signingKey?: string;

  constructor(config: CloudflareImagesConfig) {
    this.accountId = config.accountId;
    this.apiToken = config.apiToken;
    this.deliveryUrl = config.deliveryUrl || `https://imagedelivery.net/${config.accountId}`;
    this.signingKey = config.signingKey;
  }

  private async makeRequest<T = any>(
    method: string,
    path: string,
    body?: any,
  ): Promise<CloudflareImagesResponse<T>> {
    const url = `${this.baseUrl}/accounts/${this.accountId}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiToken}`,
    };

    let requestBody: any = body;

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      requestBody = JSON.stringify(body);
    }

    const response = await fetch(url, {
      body: requestBody,
      headers,
      method,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        `Cloudflare Images API error: ${data.errors.map((e: any) => e.message).join(', ')}`,
      );
    }

    return data;
  }

  async delete(key: string): Promise<void> {
    await this.makeRequest('DELETE', `/images/v1/${key}`);
  }

  async download(key: string): Promise<Blob> {
    // Cloudflare Images doesn't support direct download via API
    // Images are served via CDN URLs
    const url = `${this.deliveryUrl}/${key}/public`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    return response.blob();
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.makeRequest('GET', `/images/v1/${key}`);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(key: string): Promise<StorageObject> {
    const response = await this.makeRequest<CloudflareImage>('GET', `/images/v1/${key}`);
    const image = response.result;

    return {
      contentType: 'image/*', // Cloudflare Images handles format automatically
      key,
      lastModified: new Date(image.uploaded),
      size: 0, // Size not provided by Cloudflare Images API
      url: `${this.deliveryUrl}/${key}/public`,
    };
  }

  async getUrl(key: string, options?: { expiresIn?: number; variant?: string }): Promise<string> {
    const variant = options?.variant || 'public';
    const baseUrl = `${this.deliveryUrl}/${key}/${variant}`;

    // If signing is required and we have a signing key, generate signed URL
    if (this.signingKey && options?.expiresIn) {
      // Note: In production, you'd use a JWT library for this
      // This is a simplified example
      const _expiration = Math.floor(Date.now() / 1000) + (options.expiresIn || 3600);
      // TODO: Implement JWT signing
      logWarn('Signed URLs not implemented', { provider: 'cloudflare-images' });
      return baseUrl;
    }

    return baseUrl;
  }

  async list(options?: ListOptions): Promise<StorageObject[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('per_page', options.limit.toString());
    if (options?.cursor) params.set('page', options.cursor);

    const response = await this.makeRequest<{
      images: CloudflareImage[];
    }>('GET', `/images/v1?${params.toString()}`);

    return response.result.images.map(image => ({
      contentType: 'image/*',
      key: image.id,
      lastModified: new Date(image.uploaded),
      size: 0,
      url: `${this.deliveryUrl}/${image.id}/public`,
    }));
  }

  async upload(
    key: string,
    data: ArrayBuffer | Blob | Buffer | File | ReadableStream,
    options?: UploadOptions,
  ): Promise<StorageObject> {
    const formData = new FormData();

    // Convert data to File or Blob
    let file: Blob | File;
    if (data instanceof File || data instanceof Blob) {
      file = data;
    } else if (data instanceof ArrayBuffer) {
      file = new Blob([data], { type: options?.contentType || 'application/octet-stream' });
    } else if (data instanceof Buffer) {
      file = new Blob(
        [data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer],
        { type: options?.contentType || 'application/octet-stream' },
      );
    } else if (data instanceof ReadableStream) {
      // Convert ReadableStream to Blob
      const reader = data.getReader();
      const chunks: Uint8Array[] = [];

      try {
        let done = false;
        while (!done) {
          const result = await reader.read();
          done = result.done;
          if (!done && result.value) {
            chunks.push(result.value);
          }
        }
      } finally {
        reader.releaseLock();
      }

      file = new Blob(
        chunks.map(
          chunk =>
            chunk.buffer.slice(
              chunk.byteOffset,
              chunk.byteOffset + chunk.byteLength,
            ) as ArrayBuffer,
        ),
        { type: options?.contentType || 'application/octet-stream' },
      );
    } else {
      throw new Error('Unsupported data type for upload');
    }

    formData.append('file', file, options?.fileName);

    // Cloudflare Images specific options
    if (options?.requireSignedURLs !== undefined) {
      formData.append('requireSignedURLs', options.requireSignedURLs.toString());
    }

    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    // Custom ID support
    if (options?.id || key) {
      formData.append('id', options?.id || key);
    }

    // Progress tracking
    if (options?.onProgress) {
      // Report initial progress
      options.onProgress({
        loaded: 0,
        total: file.size,
        key,
      });
    }

    const response = await this.makeRequest<CloudflareImage>('POST', '/images/v1', formData);

    // Report completion
    if (options?.onProgress) {
      options.onProgress({
        loaded: file.size,
        total: file.size,
        key: response.result.id,
      });
    }

    return {
      contentType: 'image/*',
      key: response.result.id,
      lastModified: new Date(response.result.uploaded),
      size: file.size,
      url: `${this.deliveryUrl}/${response.result.id}/public`,
    };
  }

  // Cloudflare Images specific methods
  async createVariant(variant: CloudflareImagesVariant): Promise<void> {
    await this.makeRequest('PUT', `/images/v1/variants/${variant.id}`, variant);
  }

  async deleteVariant(variantId: string): Promise<void> {
    await this.makeRequest('DELETE', `/images/v1/variants/${variantId}`);
  }

  async listVariants(): Promise<CloudflareImagesVariant[]> {
    const response = await this.makeRequest<{
      variants: CloudflareImagesVariant[];
    }>('GET', '/images/v1/variants');

    return response.result.variants;
  }

  async getDirectUploadUrl(expiresAfter?: string): Promise<DirectUploadResponse> {
    const body = expiresAfter ? { expiry: expiresAfter } : undefined;
    const response = await this.makeRequest<DirectUploadResponse>(
      'POST',
      '/images/v2/direct_upload',
      body,
    );
    return response.result;
  }

  // Batch operations
  async createBatchToken(): Promise<CloudflareImagesBatchToken> {
    const response = await this.makeRequest<CloudflareImagesBatchToken>(
      'POST',
      '/images/v1/batch_token',
    );
    return response.result;
  }

  // Signing key management
  async listSigningKeys(): Promise<CloudflareImagesSigningKey[]> {
    const response = await this.makeRequest<{ keys: CloudflareImagesSigningKey[] }>(
      'GET',
      '/images/v1/keys',
    );
    return response.result.keys;
  }

  async createSigningKey(): Promise<CloudflareImagesSigningKey> {
    const response = await this.makeRequest<CloudflareImagesSigningKey>('POST', '/images/v1/keys');
    return response.result;
  }

  async deleteSigningKey(keyName: string): Promise<void> {
    await this.makeRequest('DELETE', `/images/v1/keys/${keyName}`);
  }

  // Usage statistics
  async getStats(): Promise<CloudflareImagesStats> {
    const response = await this.makeRequest<CloudflareImagesStats>('GET', '/images/v1/stats');
    return response.result;
  }

  // Update image metadata
  async updateImage(
    key: string,
    options: {
      requireSignedURLs?: boolean;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    await this.makeRequest('PATCH', `/images/v1/${key}`, options);
  }

  // Upload from URL
  async uploadFromUrl(
    url: string,
    options?: UploadOptions & { key?: string },
  ): Promise<StorageObject> {
    const body = {
      url,
      id: options?.key || options?.id,
      requireSignedURLs: options?.requireSignedURLs,
      metadata: options?.metadata,
    };

    const response = await this.makeRequest<CloudflareImage>('POST', '/images/v1', body);

    return {
      contentType: 'image/*',
      key: response.result.id,
      lastModified: new Date(response.result.uploaded),
      size: 0,
      url: `${this.deliveryUrl}/${response.result.id}/public`,
    };
  }

  // Get transformed image URL
  getTransformedUrl(
    key: string,
    options: CloudflareImagesTransformOptions,
    variant?: string,
  ): string {
    const v = variant || 'public';
    const params = new URLSearchParams();

    // Add transformation parameters
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    return `${this.deliveryUrl}/${key}/${v}${queryString ? `?${queryString}` : ''}`;
  }

  // Batch upload from URLs
  async batchUploadFromUrls(
    urls: Array<{ url: string; id?: string; metadata?: Record<string, any> }>,
    batchToken?: string,
  ): Promise<StorageObject[]> {
    const results: StorageObject[] = [];

    for (const item of urls) {
      try {
        const headers: Record<string, string> = batchToken ? { 'CF-Batch-Token': batchToken } : {};

        const body = {
          url: item.url,
          id: item.id,
          metadata: item.metadata,
        };

        const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/images/v1`, {
          method: 'POST',
          headers: {
            ...headers,
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (data.success) {
          results.push({
            contentType: 'image/*',
            key: data.result.id,
            lastModified: new Date(data.result.uploaded),
            size: 0,
            url: `${this.deliveryUrl}/${data.result.id}/public`,
          });
        }
      } catch (error) {
        logError('Batch upload from URL failed', { error, urls });
      }
    }

    return results;
  }

  // List images with advanced options
  async listAdvanced(options?: CloudflareImagesListOptions): Promise<{
    images: StorageObject[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    if (options?.perPage) params.set('per_page', options.perPage.toString());
    if (options?.page) params.set('page', options.page.toString());
    if (options?.sortOrder) params.set('sort_order', options.sortOrder);

    const response = await this.makeRequest<{
      images: CloudflareImage[];
      total: number;
    }>('GET', `/images/v2?${params.toString()}`);

    const images = response.result.images.map(image => ({
      contentType: 'image/*',
      key: image.id,
      lastModified: new Date(image.uploaded),
      size: 0,
      url: `${this.deliveryUrl}/${image.id}/public`,
    }));

    return {
      images,
      total: response.result.total,
      hasMore: images.length === (options?.perPage || 100),
    };
  }
}
