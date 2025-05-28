import { del, head, list, put } from '@vercel/blob';

import type { ListOptions, StorageObject, StorageProvider, UploadOptions } from '../types';

export class VercelBlobProvider implements StorageProvider {
  private token: string;

  constructor(token: string) {
    if (!token) {
      throw new Error('Vercel Blob token is required');
    }
    this.token = token;
  }

  async upload(
    key: string,
    data: Buffer | Blob | File | ArrayBuffer | ReadableStream,
    options?: UploadOptions,
  ): Promise<StorageObject> {
    const result = await put(key, data, {
      access: 'public',
      addRandomSuffix: false,
      cacheControlMaxAge: options?.cacheControl,
      contentType: options?.contentType,
      token: this.token,
    });

    // Get metadata to get size and other info
    const metadata = await head(result.url, { token: this.token });

    return {
      url: result.url,
      contentType: metadata.contentType,
      etag: undefined, // Vercel Blob doesn't provide ETags
      key: result.pathname,
      lastModified: new Date(metadata.uploadedAt),
      size: metadata.size,
    };
  }

  async download(key: string): Promise<Blob> {
    const response = await fetch(key, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download blob: ${response.statusText}`);
    }

    return response.blob();
  }

  async delete(key: string): Promise<void> {
    await del(key, { token: this.token });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await head(key, { token: this.token });
      return true;
    } catch {
      return false;
    }
  }

  async list(options?: ListOptions): Promise<StorageObject[]> {
    const result = await list({
      cursor: options?.cursor,
      limit: options?.limit,
      prefix: options?.prefix,
      token: this.token,
    });

    // For list results, we need to call head on each blob to get contentType
    return Promise.all(
      result.blobs.map(async (blob) => {
        const metadata = await head(blob.url, { token: this.token });
        return {
          url: blob.url,
          contentType: metadata.contentType || 'application/octet-stream',
          etag: undefined,
          key: blob.pathname,
          lastModified: new Date(blob.uploadedAt),
          size: blob.size,
        };
      }),
    );
  }

  async getUrl(key: string, _options?: { expiresIn?: number }): Promise<string> {
    // Vercel Blob URLs are permanent for public files
    // For private files, they include auth in the URL
    const blob = await head(key, { token: this.token });
    return blob.url;
  }

  async getMetadata(key: string): Promise<StorageObject> {
    const blob = await head(key, { token: this.token });

    return {
      url: blob.url,
      contentType: blob.contentType,
      etag: undefined,
      key: blob.pathname,
      lastModified: new Date(blob.uploadedAt),
      size: blob.size,
    };
  }
}
