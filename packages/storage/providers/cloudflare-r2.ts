import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { ListOptions, StorageObject, StorageProvider, UploadOptions } from '../types';

export interface R2Config {
  accessKeyId: string;
  accountId: string;
  bucket: string;
  secretAccessKey: string;
}

export class CloudflareR2Provider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor(config: R2Config) {
    this.bucket = config.bucket;
    this.client = new S3Client({
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
    });
  }

  async upload(
    key: string,
    data: Buffer | Blob | File | ArrayBuffer | ReadableStream,
    options?: UploadOptions,
  ): Promise<StorageObject> {
    // Convert data to Buffer if needed
    let body: Buffer | Uint8Array;

    if (data instanceof Buffer) {
      body = data;
    } else if (data instanceof Blob || data instanceof File) {
      const arrayBuffer = await data.arrayBuffer();
      body = Buffer.from(arrayBuffer);
    } else if (data instanceof ArrayBuffer) {
      body = Buffer.from(data);
    } else if (data instanceof ReadableStream) {
      const reader = data.getReader();
      const chunks: Uint8Array[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }

      body = Buffer.concat(chunks);
    } else {
      body = data as Buffer;
    }

    const command = new PutObjectCommand({
      Body: body,
      Bucket: this.bucket,
      CacheControl: options?.cacheControl ? `max-age=${options.cacheControl}` : undefined,
      ContentType: options?.contentType,
      Key: key,
      Metadata: options?.metadata,
    });

    await this.client.send(command);

    // Get metadata for the uploaded object
    return this.getMetadata(key);
  }

  async download(key: string): Promise<Blob> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error('No body in response');
    }

    // Convert stream to blob
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    return new Blob(chunks, { type: response.ContentType });
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  async list(options?: ListOptions): Promise<StorageObject[]> {
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      ContinuationToken: options?.cursor,
      MaxKeys: options?.limit,
      Prefix: options?.prefix,
    });

    const response = await this.client.send(command);

    if (!response.Contents) {
      return [];
    }

    return Promise.all(
      response.Contents.map(async (object) => {
        if (!object.Key) {
          throw new Error('Object key is missing');
        }

        // Get full metadata for each object
        const metadata = await this.getMetadata(object.Key);
        return metadata;
      }),
    );
  }

  async getUrl(key: string, options?: { expiresIn?: number }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    // Default to 1 hour if not specified
    const expiresIn = options?.expiresIn || 3600;

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getMetadata(key: string): Promise<StorageObject> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    // Generate public URL (R2 public URLs follow this pattern)
    const url = `https://pub-${this.bucket}.r2.dev/${key}`;

    return {
      url,
      contentType: response.ContentType || 'application/octet-stream',
      etag: response.ETag,
      key,
      lastModified: response.LastModified || new Date(),
      size: response.ContentLength || 0,
    };
  }
}
