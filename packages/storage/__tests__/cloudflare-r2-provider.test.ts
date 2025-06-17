import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock AWS SDK modules
const mockSend = vi.fn();

vi.mock('@aws-sdk/client-s3', () => ({
  DeleteObjectCommand: vi.fn().mockImplementation((input: any) => ({ type: 'DeleteObjectCommand', input })),
  GetObjectCommand: vi.fn().mockImplementation((input: any) => ({ type: 'GetObjectCommand', input })),
  HeadObjectCommand: vi.fn().mockImplementation((input: any) => ({ type: 'HeadObjectCommand', input })),
  ListObjectsV2Command: vi.fn().mockImplementation((input: any) => ({ type: 'ListObjectsV2Command', input })),
  PutObjectCommand: vi.fn().mockImplementation((input: any) => ({ type: 'PutObjectCommand', input })),
  UploadPartCommand: vi.fn().mockImplementation((input: any) => ({ type: 'UploadPartCommand', input })),
  CreateMultipartUploadCommand: vi.fn().mockImplementation((input: any) => ({ type: 'CreateMultipartUploadCommand', input })),
  CompleteMultipartUploadCommand: vi.fn().mockImplementation((input: any) => ({ type: 'CompleteMultipartUploadCommand', input })),
  AbortMultipartUploadCommand: vi.fn().mockImplementation((input: any) => ({ type: 'AbortMultipartUploadCommand', input })),
  S3Client: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}));

// Mock AWS SDK lib-storage for multipart uploads
const mockUploadDone = vi.fn();
const mockUploadOn = vi.fn();
const mockUpload = vi.fn();

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: vi.fn(),
}));

import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { CloudflareR2Provider } from '../providers/cloudflare-r2';

const MockedS3Client = S3Client as any;
const MockedGetSignedUrl = getSignedUrl as any;
const MockedUpload = Upload as any;

describe('CloudflareR2Provider', (_: any) => {
  const mockConfig = {
    accessKeyId: 'test-access-key',
    accountId: 'test-account-id',
    bucket: 'test-bucket',
    secretAccessKey: 'test-secret-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    MockedUpload.mockClear();
    mockUploadDone.mockClear();
    mockUploadOn.mockClear();
    MockedGetSignedUrl.mockClear();
    mockSend.mockClear();
    
    // Mock S3Client constructor to return an object with send method
    MockedS3Client.mockImplementation(() => ({
      send: mockSend,
    }));
    
    // Set up mock implementations
    mockUploadDone.mockResolvedValue({
      ETag: 'test-etag',
      Location: 'test-location',
      VersionId: 'test-version',
    });
    
    MockedUpload.mockImplementation(() => ({
      done: mockUploadDone,
      on: mockUploadOn,
    }));
  });

  describe('constructor', (_: any) => {
    it('should create provider with valid config', async () => {

      const provider = new CloudflareR2Provider(mockConfig);
      expect(provider).toBeDefined();

      expect(MockedS3Client).toHaveBeenCalledWith({
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
        endpoint: 'https://test-account-id.r2.cloudflarestorage.com',
        region: 'auto',
        forcePathStyle: true,
      });
    });

    it('should configure S3 client with correct endpoint', async () => {
      

      const config = {
        ...mockConfig,
        accountId: 'different-account',
      };

      new CloudflareR2Provider(config);

      expect(MockedS3Client).toHaveBeenCalledWith({
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
        endpoint: 'https://different-account.r2.cloudflarestorage.com',
        region: 'auto',
        forcePathStyle: true,
      });
    });
  });

  describe('upload', (_: any) => {
    it('should upload Buffer data successfully', async () => {
      

      mockSend.mockResolvedValueOnce({}); // PutObjectCommand response
      mockSend.mockResolvedValueOnce({
        ContentLength: 1024,
        // HeadObjectCommand response for getMetadata
        ContentType: 'text/plain',
        ETag: '"abc123"',
        LastModified: new Date('2023-01-01T00:00:00Z'),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const buffer = Buffer.from('test data');

      const result = await provider.upload('test-key', buffer, {
        cacheControl: 3600,
        contentType: 'text/plain',
        metadata: { custom: 'value' },
      });

      expect(mockSend).toHaveBeenCalledTimes(2);

      // Check PutObjectCommand
      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.type).toBe('PutObjectCommand');
      expect(putCommand.input).toEqual({
        Body: buffer,
        Bucket: 'test-bucket',
        CacheControl: 'max-age=3600',
        ContentType: 'text/plain',
        Key: 'test-key',
        Metadata: { custom: 'value' },
      });

      expect(result).toEqual({
        url: 'https://pub-test-bucket.r2.dev/test-key',
        contentType: 'text/plain',
        etag: '"abc123"',
        key: 'test-key',
        lastModified: new Date('2023-01-01T00:00:00Z'),
        size: 1024,
      });
    });

    it('should upload Blob data successfully', async () => {
      

      mockSend.mockResolvedValueOnce({});
      mockSend.mockResolvedValueOnce({
        ContentLength: 9,
        ContentType: 'text/plain',
        ETag: '"def456"',
        LastModified: new Date(),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const blob = new Blob(['test data'], { type: 'text/plain' });

      await provider.upload('test-key', blob);

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input.Body).toBeInstanceOf(Buffer);
    });

    it('should upload File data successfully', async () => {
      

      mockSend.mockResolvedValueOnce({});
      mockSend.mockResolvedValueOnce({
        ContentLength: 9,
        ContentType: 'text/plain',
        LastModified: new Date(),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const file = new File(['test data'], 'test.txt', { type: 'text/plain' });

      await provider.upload('test-key', file);

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input.Body).toBeInstanceOf(Buffer);
    });

    it('should upload ArrayBuffer data successfully', async () => {
      

      mockSend.mockResolvedValueOnce({});
      mockSend.mockResolvedValueOnce({
        ContentLength: 8,
        LastModified: new Date(),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const arrayBuffer = new ArrayBuffer(8);

      await provider.upload('test-key', arrayBuffer);

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input.Body).toBeInstanceOf(Buffer);
    });

    it('should upload ReadableStream data successfully', async () => {
      

      // Mock multipart upload for streams
      mockUploadDone.mockResolvedValueOnce({
        ETag: '"stream-etag"',
        VersionId: 'stream-version',
      });

      mockSend.mockResolvedValueOnce({
        ContentLength: 4,
        LastModified: new Date(),
        ContentType: 'application/octet-stream',
        ETag: '"stream-etag"',
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([1, 2, 3, 4]));
          controller.close();
        },
      });

      const result = await provider.upload('test-key', stream);

      // Should use multipart upload for streams
      expect(MockedUpload).toHaveBeenCalled();
      expect(mockUploadDone).toHaveBeenCalled();
      expect(result.key).toBe('test-key');
    });

    it('should upload without options', async () => {
      

      mockSend.mockResolvedValueOnce({});
      mockSend.mockResolvedValueOnce({
        ContentLength: 1024,
        LastModified: new Date(),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const buffer = Buffer.from('test data');

      await provider.upload('test-key', buffer);

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input).toEqual({
        Body: buffer,
        Bucket: 'test-bucket',
        CacheControl: undefined,
        ContentType: undefined,
        Key: 'test-key',
        Metadata: undefined,
      });
    });

    it('should handle upload errors', async () => {
      

      mockSend.mockRejectedValue(new Error('S3 upload failed'));

      const provider = new CloudflareR2Provider(mockConfig);
      const buffer = Buffer.from('test data');

      await expect(provider.upload('test-key', buffer)).rejects.toThrow('S3 upload failed');
    });
  });

  describe('download', (_: any) => {
    it('should download object successfully', async () => {
      

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([116, 101, 115, 116])); // 'test'
          controller.close();
        },
      });

      mockSend.mockResolvedValue({
        Body: {
          transformToWebStream: () => mockStream,
        },
        ContentType: 'text/plain',
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.download('test-key');

      expect(mockSend).toHaveBeenCalledWith({
        type: 'GetObjectCommand',
        input: {
          Bucket: 'test-bucket',
          Key: 'test-key',
        },
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/plain');
    });

    it('should handle download without body', async () => {
      

      mockSend.mockResolvedValue({
        ContentType: 'text/plain',
      });

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.download('test-key')).rejects.toThrow('No body in response');
    });

    it('should handle download errors', async () => {
      

      mockSend.mockRejectedValue(new Error('Object not found'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.download('test-key')).rejects.toThrow('Object not found');
    });

    it('should handle stream reading errors', async () => {
      

      const mockStream = new ReadableStream({
        start(controller) {
          controller.error(new Error('Stream error'));
        },
      });

      mockSend.mockResolvedValue({
        Body: {
          transformToWebStream: () => mockStream,
        },
        ContentType: 'text/plain',
      });

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.download('test-key')).rejects.toThrow('Stream error');
    });
  });

  describe('delete', (_: any) => {
    it('should delete object successfully', async () => {
      

      mockSend.mockResolvedValue({});

      const provider = new CloudflareR2Provider(mockConfig);
      await provider.delete('test-key');

      expect(mockSend).toHaveBeenCalledWith({
        type: 'DeleteObjectCommand',
        input: {
          Bucket: 'test-bucket',
          Key: 'test-key',
        },
      });
    });

    it('should handle delete errors', async () => {
      

      mockSend.mockRejectedValue(new Error('Delete failed'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.delete('test-key')).rejects.toThrow('Delete failed');
    });
  });

  describe('exists', (_: any) => {
    it('should return true when object exists', async () => {
      

      mockSend.mockResolvedValue({
        ContentLength: 1024,
        LastModified: new Date(),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.exists('test-key');

      expect(mockSend).toHaveBeenCalledWith({
        type: 'HeadObjectCommand',
        input: {
          Bucket: 'test-bucket',
          Key: 'test-key',
        },
      });

      expect(result).toBe(true);
    });

    it('should return false when object does not exist (NotFound error)', async () => {
      

      const notFoundError = new Error('Not found');
      notFoundError.name = 'NotFound';
      mockSend.mockRejectedValue(notFoundError);

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.exists('test-key');

      expect(result).toBe(false);
    });

    it('should return false when object does not exist (404 status)', async () => {
      

      const notFoundError = new Error('Not found') as Error & {
        $metadata: { httpStatusCode: number };
      };
      notFoundError.$metadata = { httpStatusCode: 404 };
      mockSend.mockRejectedValue(notFoundError);

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.exists('test-key');

      expect(result).toBe(false);
    });

    it('should throw error for non-NotFound errors', async () => {
      

      const accessError = new Error('Access denied');
      mockSend.mockRejectedValue(accessError);

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.exists('test-key')).rejects.toThrow('Access denied');
    });
  });

  describe('list', (_: any) => {
    it('should list objects successfully', async () => {
      

      // Mock list response with full object data
      mockSend.mockResolvedValueOnce({
        Contents: [
          {
            Key: 'file1.txt',
            Size: 1024,
            ETag: '"abc123"',
            LastModified: new Date('2023-01-01T00:00:00Z'),
          },
          {
            Key: 'file2.txt',
            Size: 2048,
            ETag: '"def456"',
            LastModified: new Date('2023-01-02T00:00:00Z'),
          },
        ],
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.list();

      expect(mockSend).toHaveBeenCalledTimes(1); // Only list, no HEAD calls

      // Check ListObjectsV2Command
      expect(mockSend.mock.calls[0][0]).toEqual({
        type: 'ListObjectsV2Command',
        input: {
          Bucket: 'test-bucket',
          ContinuationToken: undefined,
          MaxKeys: undefined,
          Prefix: undefined,
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        url: 'https://pub-test-bucket.r2.dev/file1.txt',
        contentType: 'application/octet-stream', // Default since no HEAD request
        etag: '"abc123"',
        key: 'file1.txt',
        lastModified: new Date('2023-01-01T00:00:00Z'),
        size: 1024,
      });
    });

    it('should list objects with options', async () => {
      

      mockSend.mockResolvedValueOnce({
        Contents: [],
      });

      const provider = new CloudflareR2Provider(mockConfig);
      await provider.list({
        cursor: 'next-token',
        limit: 50,
        prefix: 'documents/',
      });

      expect(mockSend.mock.calls[0][0]).toEqual({
        type: 'ListObjectsV2Command',
        input: {
          Bucket: 'test-bucket',
          ContinuationToken: 'next-token',
          MaxKeys: 50,
          Prefix: 'documents/',
        },
      });
    });

    it('should handle empty list results', async () => {
      

      mockSend.mockResolvedValue({
        Contents: undefined,
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.list();

      expect(result).toEqual([]);
    });

    it('should handle list errors', async () => {
      

      mockSend.mockRejectedValue(new Error('List failed'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.list()).rejects.toThrow('List failed');
    });

    it('should handle missing object keys', async () => {
      

      mockSend.mockResolvedValue({
        Contents: [
          { Key: 'file1.txt' },
          {}, // Missing Key
        ],
      });

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.list()).rejects.toThrow('Object key is missing');
    });
  });

  describe('getUrl', (_: any) => {
    it('should generate signed URL with default expiration', async () => {
      

      MockedGetSignedUrl.mockResolvedValue('https://signed-url.example.com/test-key');

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.getUrl('test-key');

      expect(MockedGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object), // S3Client instance
        {
          type: 'GetObjectCommand',
          input: {
            Bucket: 'test-bucket',
            Key: 'test-key',
          },
        },
        { expiresIn: 3600 }, // Default 1 hour
      );

      expect(result).toBe('https://signed-url.example.com/test-key');
    });

    it('should generate signed URL with custom expiration', async () => {
      

      MockedGetSignedUrl.mockResolvedValue('https://signed-url.example.com/test-key');

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.getUrl('test-key', { expiresIn: 7200 });

      expect(MockedGetSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), {
        expiresIn: 7200,
      });

      expect(result).toBe('https://signed-url.example.com/test-key');
    });

    it('should handle getUrl errors', async () => {
      

      MockedGetSignedUrl.mockRejectedValue(new Error('Signing failed'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.getUrl('test-key')).rejects.toThrow('Signing failed');
    });
  });

  describe('getMetadata', (_: any) => {
    it('should get object metadata successfully', async () => {
      

      mockSend.mockResolvedValue({
        ContentLength: 2048,
        ContentType: 'application/json',
        ETag: '"xyz789"',
        LastModified: new Date('2023-01-01T12:00:00Z'),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.getMetadata('test-key');

      expect(mockSend).toHaveBeenCalledWith({
        type: 'HeadObjectCommand',
        input: {
          Bucket: 'test-bucket',
          Key: 'test-key',
        },
      });

      expect(result).toEqual({
        url: 'https://pub-test-bucket.r2.dev/test-key',
        contentType: 'application/json',
        etag: '"xyz789"',
        key: 'test-key',
        lastModified: new Date('2023-01-01T12:00:00Z'),
        size: 2048,
      });
    });

    it('should handle missing optional fields in metadata', async () => {
      

      mockSend.mockResolvedValue({
        // Missing ContentType, LastModified, ETag, ContentLength
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.getMetadata('test-key');

      expect(result).toEqual({
        url: 'https://pub-test-bucket.r2.dev/test-key',
        contentType: 'application/octet-stream', // default
        etag: undefined,
        key: 'test-key',
        lastModified: expect.any(Date), // default new Date()
        size: 0, // default
      });
    });

    it('should handle getMetadata errors', async () => {
      

      mockSend.mockRejectedValue(new Error('Object not found'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.getMetadata('test-key')).rejects.toThrow('Object not found');
    });
  });

  describe('public URL generation', (_: any) => {
    it('should generate correct public URLs for different buckets', async () => {
      

      const config = {
        ...mockConfig,
        bucket: 'my-custom-bucket',
      };

      mockSend.mockResolvedValue({
        ContentLength: 1024,
        ContentType: 'text/plain',
        LastModified: new Date(),
      });

      const provider = new CloudflareR2Provider(config);
      const result = await provider.getMetadata('path/to/file.txt');

      expect(result.url).toBe('https://pub-my-custom-bucket.r2.dev/path/to/file.txt');
    });

    it('should handle special characters in object keys', async () => {
      

      mockSend.mockResolvedValue({
        ContentLength: 1024,
        ContentType: 'text/plain',
        LastModified: new Date(),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.getMetadata('files with spaces/special@chars.txt');

      expect(result.url).toBe('https://pub-test-bucket.r2.dev/files with spaces/special@chars.txt');
    });
  });

  describe('error handling and edge cases', (_: any) => {
    it('should handle different error types correctly', async () => {
      

      const provider = new CloudflareR2Provider(mockConfig);

      // Test 404 error
      const notFoundError = new Error('Not found') as Error & {
        $metadata: { httpStatusCode: number };
      };
      notFoundError.$metadata = { httpStatusCode: 404 };
      mockSend.mockRejectedValueOnce(notFoundError);

      expect(await provider.exists('missing-key')).toBe(false);

      // Test other errors
      mockSend.mockRejectedValueOnce(new Error('Network error'));
      await expect(provider.exists('test-key')).rejects.toThrow('Network error');
    });

    it('should handle concurrent operations', async () => {
      

      mockSend.mockResolvedValue({
        ContentLength: 1024,
        LastModified: new Date(),
      });

      const provider = new CloudflareR2Provider(mockConfig);

      // Multiple concurrent exists checks
      const promises = Array.from({ length: 3 }, (_, i) => provider.exists(`test-key-${i}`));

      const results = await Promise.all(promises);
      expect(results).toEqual([true, true, true]);
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it('should handle ReadableStream conversion errors', async () => {
      

      // Mock multipart upload to fail
      mockUploadDone.mockRejectedValueOnce(new Error('Stream conversion error'));

      const provider = new CloudflareR2Provider(mockConfig);

      // Create a stream that errors during read
      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([1, 2]));
          controller.error(new Error('Stream conversion error'));
        },
      });

      await expect(provider.upload('test-key', errorStream)).rejects.toThrow(
        'Stream conversion error',
      );
    });
  });
});
