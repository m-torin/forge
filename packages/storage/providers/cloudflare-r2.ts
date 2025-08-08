import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CompleteMultipartUploadCommandOutput,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

import { logError } from '@repo/observability/server/next';
import {
  EnhancedR2Credentials,
  ListOptions,
  MultipartUploadResult,
  R2Credentials,
  StorageObject,
  StorageProvider,
  UploadOptions,
} from '../types';

export class CloudflareR2Provider implements StorageProvider {
  private bucket: string;
  private client: S3Client;
  private customDomain?: string;
  private defaultPartSize: number;
  private defaultQueueSize: number;

  constructor(config: R2Credentials | EnhancedR2Credentials) {
    this.bucket = config.bucket;
    this.customDomain = (config as EnhancedR2Credentials).customDomain;
    this.defaultPartSize = (config as EnhancedR2Credentials).defaultPartSize || 5 * 1024 * 1024; // 5MB default
    this.defaultQueueSize = (config as EnhancedR2Credentials).defaultQueueSize || 4; // 4 concurrent uploads

    this.client = new S3Client({
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      forcePathStyle: true,
    });
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
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

    // Handle different response body types
    if ('stream' in response.Body && typeof response.Body.stream === 'function') {
      // For environments that support web streams
      const stream = response.Body.stream();
      const chunks: Uint8Array[] = [];
      const reader = stream.getReader();

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

      return new Blob(
        chunks.map(
          chunk =>
            chunk.buffer.slice(
              chunk.byteOffset,
              chunk.byteOffset + chunk.byteLength,
            ) as ArrayBuffer,
        ),
        { type: response.ContentType },
      );
    }

    // For browser environments, use web streams
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    try {
      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (!done) {
          chunks.push(result.value);
        }
      }
    } finally {
      reader.releaseLock();
    }

    return new Blob(
      chunks.map(
        chunk =>
          chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength) as ArrayBuffer,
      ),
      { type: response.ContentType },
    );
  }

  async downloadStream(key: string): Promise<ReadableStream> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error('No body in response');
    }

    // Return as web stream
    return response.Body.transformToWebStream();
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

  async getMetadata(key: string): Promise<StorageObject> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    // Generate URL based on custom domain or default pattern
    const url = this.customDomain
      ? `https://${this.customDomain}/${key}`
      : `https://pub-${this.bucket}.r2.dev/${key}`;

    return {
      contentType: response.ContentType ?? 'application/octet-stream',
      etag: response.ETag,
      key,
      lastModified: response.LastModified ?? new Date(),
      size: response.ContentLength ?? 0,
      url,
    };
  }

  async getUrl(key: string, options?: { expiresIn?: number }): Promise<string> {
    // If using custom domain and no expiration needed, return direct URL
    if (this.customDomain && !options?.expiresIn) {
      return `https://${this.customDomain}/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    // Default to 1 hour if not specified
    const expiresIn = options?.expiresIn ?? 3600;

    return getSignedUrl(this.client, command, { expiresIn });
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

    // Batch metadata retrieval for better performance
    const metadataPromises = response.Contents.map(async (object: any) => {
      if (!object.Key) {
        throw new Error('Object key is missing');
      }

      // For list operations, construct basic metadata without additional HEAD request
      const url = this.customDomain
        ? `https://${this.customDomain}/${object.Key}`
        : `https://pub-${this.bucket}.r2.dev/${object.Key}`;

      return {
        key: object.Key,
        size: object.Size ?? 0,
        lastModified: object.LastModified ?? new Date(),
        etag: object.ETag,
        url,
        contentType: 'application/octet-stream', // Would need HEAD request for actual type
      } as StorageObject;
    });

    return Promise.all(metadataPromises);
  }

  async upload(
    key: string,
    data: ArrayBuffer | Blob | Buffer | File | ReadableStream | Readable,
    options?: UploadOptions,
  ): Promise<MultipartUploadResult> {
    const _contentType = options?.contentType || 'application/octet-stream';

    // Determine if we should use multipart upload
    const shouldUseMultipart = await this.shouldUseMultipart(data, options);

    if (shouldUseMultipart) {
      return this.multipartUpload(key, data, options);
    }

    // Simple upload for small files
    return this.simpleUpload(key, data, options);
  }

  private async shouldUseMultipart(
    data: ArrayBuffer | Blob | Buffer | File | ReadableStream | Readable,
    options?: UploadOptions,
  ): Promise<boolean> {
    // Always use multipart for streams (unknown size)
    if (data instanceof ReadableStream || data instanceof Readable) {
      return true;
    }

    // Check size for other data types
    let size = 0;
    if (data instanceof ArrayBuffer) {
      size = data.byteLength;
    } else if (data instanceof Blob || data instanceof File) {
      size = data.size;
    } else if (data instanceof Buffer) {
      size = data.length;
    }

    // Use multipart for files > 100MB or if explicitly requested
    return size > 100 * 1024 * 1024 || options?.partSize !== undefined;
  }

  private async simpleUpload(
    key: string,
    data: ArrayBuffer | Blob | Buffer | File | ReadableStream | Readable,
    options?: UploadOptions,
  ): Promise<StorageObject> {
    // Convert data to Buffer/Uint8Array for simple upload
    let body: Buffer | Uint8Array | Readable;

    if (data instanceof Readable) {
      body = data;
    } else if (data instanceof Buffer) {
      body = data;
    } else if (data instanceof ArrayBuffer) {
      body = Buffer.from(data);
    } else if (data instanceof Blob || data instanceof File) {
      const arrayBuffer = await data.arrayBuffer();
      body = Buffer.from(arrayBuffer);
    } else if (data instanceof ReadableStream) {
      // For ReadableStream, convert to buffer first
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

    // Report progress if callback provided
    if (options?.onProgress) {
      const size = body instanceof Buffer ? body.length : 0;
      options.onProgress({
        loaded: size,
        total: size,
        key,
      });
    }

    return this.getMetadata(key);
  }

  private async multipartUpload(
    key: string,
    data: ArrayBuffer | Blob | Buffer | File | ReadableStream | Readable,
    options?: UploadOptions,
  ): Promise<MultipartUploadResult> {
    // Convert data to appropriate format for multipart upload
    let body: Buffer | Readable | ReadableStream;
    let contentLength: number | undefined;

    if (data instanceof Readable) {
      body = data;
    } else if (data instanceof ReadableStream) {
      body = data;
    } else if (data instanceof Buffer) {
      body = data;
      contentLength = data.length;
    } else if (data instanceof ArrayBuffer) {
      body = Buffer.from(data);
      contentLength = data.byteLength;
    } else if (data instanceof Blob || data instanceof File) {
      // For Blob/File, convert to buffer for AWS SDK
      const arrayBuffer = await data.arrayBuffer();
      body = Buffer.from(arrayBuffer);
      contentLength = data.size;
    } else {
      throw new Error('Unsupported data type for multipart upload');
    }

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: options?.contentType,
        CacheControl: options?.cacheControl ? `max-age=${options.cacheControl}` : undefined,
        Metadata: options?.metadata,
        ContentLength: contentLength,
      },
      partSize: options?.partSize || this.defaultPartSize,
      queueSize: options?.queueSize || this.defaultQueueSize,
      leavePartsOnError: options?.leavePartsOnError || false,
    });

    // Track upload progress
    if (options?.onProgress) {
      const onProgress = options.onProgress;
      upload.on('httpUploadProgress', (progress: any) => {
        onProgress({
          loaded: progress.loaded || 0,
          total: progress.total || contentLength || 0,
          part: progress.part,
          key,
        });
      });
    }

    try {
      const result = await upload.done();
      const completeResult = result as CompleteMultipartUploadCommandOutput;

      // Get full metadata
      const metadata = await this.getMetadata(key);

      return {
        ...metadata,
        uploadId: completeResult.VersionId,
        etag: completeResult.ETag,
      } as MultipartUploadResult;
    } catch (error) {
      // Log error details for debugging
      logError('Multipart upload failed', { error, key });
      throw error;
    }
  }

  // Additional R2-specific methods

  /**
   * Get a presigned URL for uploading (PUT method)
   * This allows clients to upload directly to R2 without exposing credentials
   */
  async getPresignedUploadUrl(
    key: string,
    options?: {
      expiresIn?: number;
      contentType?: string;
      contentLength?: number;
      metadata?: Record<string, string>;
    },
  ): Promise<{ url: string; headers?: Record<string, string> }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: options?.contentType,
      ContentLength: options?.contentLength,
      Metadata: options?.metadata,
    });

    const expiresIn = options?.expiresIn ?? 3600; // Default 1 hour
    const url = await getSignedUrl(this.client, command, { expiresIn });

    // Return headers that client should include
    const headers: Record<string, string> = {};
    if (options?.contentType) {
      headers['Content-Type'] = options.contentType;
    }
    if (options?.contentLength) {
      headers['Content-Length'] = options.contentLength.toString();
    }

    return { url, headers };
  }

  /**
   * Get a presigned POST policy for uploading
   * This is more secure as it allows setting conditions and field constraints
   */
  async getPresignedPostPolicy(
    key: string,
    options?: {
      expiresIn?: number;
      contentType?: string;
      contentLengthRange?: { min: number; max: number };
      metadata?: Record<string, string>;
    },
  ): Promise<{
    url: string;
    fields: Record<string, string>;
  }> {
    // Note: AWS SDK v3 doesn't have built-in createPresignedPost like v2
    // This is a simplified implementation - in production, you might want to use @aws-sdk/s3-presigned-post
    const expiresIn = options?.expiresIn ?? 3600;
    const policy = {
      expiration: new Date(Date.now() + expiresIn * 1000).toISOString(),
      conditions: [
        { bucket: this.bucket },
        { key },
        [
          'content-length-range',
          options?.contentLengthRange?.min || 0,
          options?.contentLengthRange?.max || 104857600,
        ], // 100MB max
      ],
    };

    if (options?.contentType) {
      policy.conditions.push(['eq', '$Content-Type', options.contentType]);
    }

    // This would need proper implementation with signature
    // For now, returning structure
    return {
      url: `https://${this.bucket}.r2.cloudflarestorage.com/`,
      fields: {
        key,
        'Content-Type': options?.contentType || 'application/octet-stream',
        // Additional fields would include policy, signature, etc.
      },
    };
  }

  /**
   * Get public URL (unsigned) - only works if bucket has public access
   */
  getPublicUrl(key: string): string {
    if (this.customDomain) {
      return `https://${this.customDomain}/${key}`;
    }
    // R2 public URL pattern
    return `https://pub-${this.bucket}.r2.dev/${key}`;
  }

  /**
   * Get presigned URL for downloading (GET method) with options
   */
  async getPresignedDownloadUrl(
    key: string,
    options?: {
      expiresIn?: number;
      responseContentDisposition?: string;
      responseContentType?: string;
    },
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: options?.responseContentDisposition,
      ResponseContentType: options?.responseContentType,
    });

    const expiresIn = options?.expiresIn ?? 3600;
    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Get presigned URL for multipart upload part
   */
  async getPresignedPartUploadUrl(
    key: string,
    uploadId: string,
    partNumber: number,
    options?: {
      expiresIn?: number;
    },
  ): Promise<string> {
    const command = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const expiresIn = options?.expiresIn ?? 3600;
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async createMultipartUpload(key: string, options?: UploadOptions): Promise<string> {
    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: options?.contentType,
      CacheControl: options?.cacheControl ? `max-age=${options.cacheControl}` : undefined,
      Metadata: options?.metadata,
    });

    const response = await this.client.send(command);

    if (!response.UploadId) {
      throw new Error('Failed to create multipart upload');
    }

    return response.UploadId;
  }

  async uploadPart(
    key: string,
    uploadId: string,
    partNumber: number,
    body: Buffer | Uint8Array,
  ): Promise<{ ETag?: string }> {
    const command = new UploadPartCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: body,
    });

    const response = await this.client.send(command);
    return { ETag: response.ETag };
  }

  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Array<{ PartNumber: number; ETag?: string }>,
  ): Promise<CompleteMultipartUploadCommandOutput> {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });

    return this.client.send(command);
  }

  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucket,
      Key: key,
      UploadId: uploadId,
    });

    await this.client.send(command);
  }

  // Utility method for uploading from a URL
  async uploadFromUrl(key: string, url: string, options?: UploadOptions): Promise<StorageObject> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from URL: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    // Use streaming upload for large files
    if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {
      return this.upload(key, response.body || new ReadableStream(), {
        ...options,
        contentType: options?.contentType || contentType,
      });
    }

    // For smaller files, buffer in memory
    const arrayBuffer = await response.arrayBuffer();
    return this.upload(key, arrayBuffer, {
      ...options,
      contentType: options?.contentType || contentType,
    });
  }
}
