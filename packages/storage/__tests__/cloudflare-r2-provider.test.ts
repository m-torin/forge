import { beforeEach, describe, expect, vi } from 'vitest';

import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { CloudflareR2Provider } from '../providers/cloudflare-r2';

// Mock AWS SDK modules
const mockSend = vi.fn();

// Create mock command constructors that return objects with the expected structure
const _createMockCommand = (type: string) => {
  return vi.fn().mockImplementation((input: any) => ({ type, input }));
};

vi.mock('@aws-sdk/client-s3', () => ({
  DeleteObjectCommand: vi
    .fn()
    .mockImplementation((input: any) => ({ type: 'DeleteObjectCommand', input })),
  GetObjectCommand: vi
    .fn()
    .mockImplementation((input: any) => ({ type: 'GetObjectCommand', input })),
  HeadObjectCommand: vi
    .fn()
    .mockImplementation((input: any) => ({ type: 'HeadObjectCommand', input })),
  ListObjectsV2Command: vi
    .fn()
    .mockImplementation((input: any) => ({ type: 'ListObjectsV2Command', input })),
  PutObjectCommand: vi
    .fn()
    .mockImplementation((input: any) => ({ type: 'PutObjectCommand', input })),
  UploadPartCommand: vi
    .fn()
    .mockImplementation((input: any) => ({ type: 'UploadPartCommand', input })),
  CreateMultipartUploadCommand: vi
    .fn()
    .mockImplementation((input: any) => ({ type: 'CreateMultipartUploadCommand', input })),
  CompleteMultipartUploadCommand: vi
    .fn()
    .mockImplementation((input: any) => ({ type: 'CompleteMultipartUploadCommand', input })),
  AbortMultipartUploadCommand: vi
    .fn()
    .mockImplementation((input: any) => ({ type: 'AbortMultipartUploadCommand', input })),
  S3Client: vi.fn(),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}));

// Mock AWS SDK lib-storage for multipart uploads
const mockUploadDone = vi.fn();
const mockUploadOn = vi.fn();

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: vi.fn(),
}));

const MockedS3Client = S3Client as any;
const MockedGetSignedUrl = getSignedUrl as any;
const MockedUpload = Upload as any;

describe('cloudflareR2Provider', () => {
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

    // Mock getSignedUrl to return a URL
    MockedGetSignedUrl.mockResolvedValue('https://signed-url.com/test-key');
  });

  describe('constructor', () => {
    test('should create provider with valid config', async () => {
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

    test('should configure S3 client with correct endpoint', async () => {
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

  describe('upload', () => {
    test('should upload Buffer data successfully', async () => {
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

    test('should upload Blob data successfully', async () => {
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

    test('should upload File data successfully', async () => {
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

    test('should upload ArrayBuffer data successfully', async () => {
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

    test('should upload ReadableStream data successfully', async () => {
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
      expect(MockedUpload).toHaveBeenCalledWith({
        client: expect.any(Object),
        params: {
          Bucket: 'test-bucket',
          Key: 'test-key',
          Body: stream,
          ContentType: undefined,
          CacheControl: undefined,
          Metadata: undefined,
          ContentLength: undefined,
        },
        partSize: 5242880,
        queueSize: 4,
        leavePartsOnError: false,
      });
      expect(mockUploadDone).toHaveBeenCalledWith();
      expect(result.key).toBe('test-key');
    });

    test('should upload without options', async () => {
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

    test('should handle upload errors', async () => {
      mockSend.mockRejectedValue(new Error('S3 upload failed'));

      const provider = new CloudflareR2Provider(mockConfig);
      const buffer = Buffer.from('test data');

      await expect(provider.upload('test-key', buffer)).rejects.toThrow('S3 upload failed');
    });
  });

  describe('download', () => {
    test('should download object successfully', async () => {
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

    test('should handle download without body', async () => {
      mockSend.mockResolvedValue({
        ContentType: 'text/plain',
      });

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.download('test-key')).rejects.toThrow('No body in response');
    });

    test('should handle download errors', async () => {
      mockSend.mockRejectedValue(new Error('Object not found'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.download('test-key')).rejects.toThrow('Object not found');
    });

    test('should handle stream reading errors', async () => {
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

  describe('delete', () => {
    test('should delete object successfully', async () => {
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

    test('should handle delete errors', async () => {
      mockSend.mockRejectedValue(new Error('Delete failed'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.delete('test-key')).rejects.toThrow('Delete failed');
    });
  });

  describe('exists', () => {
    test('should return true when object exists', async () => {
      mockSend.mockResolvedValue({
        ContentLength: 1024,
        LastModified: new Date(),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.exists('test-key');

      const headCommand = mockSend.mock.calls[0][0];
      expect(headCommand.type).toBe('HeadObjectCommand');
      expect(headCommand.input).toEqual({
        Bucket: 'test-bucket',
        Key: 'test-key',
      });

      expect(result).toBeTruthy();
    });

    test('should return false when object does not exist (NotFound error)', async () => {
      const error = new Error('Not Found');
      (error as any).name = 'NotFound';
      mockSend.mockRejectedValue(error);

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.exists('test-key');

      expect(result).toBeFalsy();
    });

    test('should return false when object does not exist (404 status)', async () => {
      const error = new Error('Not Found');
      (error as any).$metadata = { httpStatusCode: 404 };
      mockSend.mockRejectedValue(error);

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.exists('test-key');

      expect(result).toBeFalsy();
    });

    test('should throw error for non-NotFound errors', async () => {
      mockSend.mockRejectedValue(new Error('Access denied'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.exists('test-key')).rejects.toThrow('Access denied');
    });
  });

  describe('list', () => {
    test('should list objects successfully', async () => {
      mockSend.mockResolvedValue({
        Contents: [
          {
            Key: 'test1.txt',
            Size: 1024,
            LastModified: new Date('2023-01-01T00:00:00Z'),
          },
          {
            Key: 'test2.txt',
            Size: 2048,
            LastModified: new Date('2023-01-02T00:00:00Z'),
          },
        ],
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.list();

      const listCommand = mockSend.mock.calls[0][0];
      expect(listCommand.type).toBe('ListObjectsV2Command');
      expect(listCommand.input).toEqual({
        Bucket: 'test-bucket',
        ContinuationToken: undefined,
        MaxKeys: undefined,
        Prefix: undefined,
      });

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('test1.txt');
      expect(result[1].key).toBe('test2.txt');
    });

    test('should list objects with options', async () => {
      mockSend.mockResolvedValue({
        Contents: [
          {
            Key: 'test.txt',
            Size: 1024,
            LastModified: new Date(),
          },
        ],
      });

      const provider = new CloudflareR2Provider(mockConfig);
      await provider.list({
        prefix: 'test/',
        limit: 10,
        cursor: 'next-token',
      });

      const listCommand = mockSend.mock.calls[0][0];
      expect(listCommand.input).toEqual({
        Bucket: 'test-bucket',
        ContinuationToken: 'next-token',
        MaxKeys: 10,
        Prefix: 'test/',
      });
    });

    test('should handle empty list results', async () => {
      mockSend.mockResolvedValue({});

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.list();

      expect(result).toEqual([]);
    });

    test('should handle list errors', async () => {
      mockSend.mockRejectedValue(new Error('List failed'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.list()).rejects.toThrow('List failed');
    });

    test('should handle missing object keys', async () => {
      mockSend.mockResolvedValue({
        Contents: [
          {
            Size: 1024,
            LastModified: new Date(),
            // Missing Key
          },
        ],
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.list();

      expect(result).toHaveLength(0);
    });
  });

  describe('getUrl', () => {
    test('should generate signed URL with default expiration', async () => {
      const provider = new CloudflareR2Provider(mockConfig);
      const url = await provider.getUrl('test-key');

      expect(MockedGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        {
          type: 'GetObjectCommand',
          input: {
            Bucket: 'test-bucket',
            Key: 'test-key',
          },
        },
        {
          expiresIn: 3600,
        },
      );

      expect(url).toBe('https://signed-url.com/test-key');
    });

    test('should generate signed URL with custom expiration', async () => {
      const provider = new CloudflareR2Provider(mockConfig);
      await provider.getUrl('test-key', { expiresIn: 7200 });

      expect(MockedGetSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(Object), {
        expiresIn: 7200,
      });
    });

    test('should handle getUrl errors', async () => {
      MockedGetSignedUrl.mockRejectedValue(new Error('URL generation failed'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.getUrl('test-key')).rejects.toThrow('URL generation failed');
    });
  });

  describe('getMetadata', () => {
    test('should get object metadata successfully', async () => {
      mockSend.mockResolvedValue({
        ContentLength: 1024,
        ContentType: 'text/plain',
        ETag: '"abc123"',
        LastModified: new Date('2023-01-01T00:00:00Z'),
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.getMetadata('test-key');

      const headCommand = mockSend.mock.calls[0][0];
      expect(headCommand.type).toBe('HeadObjectCommand');
      expect(headCommand.input).toEqual({
        Bucket: 'test-bucket',
        Key: 'test-key',
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

    test('should handle missing optional fields in metadata', async () => {
      mockSend.mockResolvedValue({
        // Minimal response without optional fields
      });

      const provider = new CloudflareR2Provider(mockConfig);
      const result = await provider.getMetadata('test-key');

      expect(result).toEqual({
        url: 'https://pub-test-bucket.r2.dev/test-key',
        contentType: 'application/octet-stream',
        etag: undefined,
        key: 'test-key',
        lastModified: new Date(),
        size: 0,
      });
    });

    test('should handle getMetadata errors', async () => {
      mockSend.mockRejectedValue(new Error('Metadata fetch failed'));

      const provider = new CloudflareR2Provider(mockConfig);

      await expect(provider.getMetadata('test-key')).rejects.toThrow('Metadata fetch failed');
    });
  });

  describe('public URL generation', () => {
    test('should generate correct public URLs for different buckets', () => {
      const provider1 = new CloudflareR2Provider({
        ...mockConfig,
        bucket: 'bucket1',
      });
      const provider2 = new CloudflareR2Provider({
        ...mockConfig,
        bucket: 'bucket2',
      });

      expect(provider1.getPublicUrl('test.txt')).toBe('https://pub-bucket1.r2.dev/test.txt');
      expect(provider2.getPublicUrl('test.txt')).toBe('https://pub-bucket2.r2.dev/test.txt');
    });

    test('should handle special characters in object keys', () => {
      const provider = new CloudflareR2Provider(mockConfig);

      expect(provider.getPublicUrl('test file.txt')).toBe(
        'https://pub-test-bucket.r2.dev/test file.txt',
      );
      expect(provider.getPublicUrl('test/file/path.txt')).toBe(
        'https://pub-test-bucket.r2.dev/test/file/path.txt',
      );
    });
  });

  describe('error handling and edge cases', () => {
    test('should handle different error types correctly', async () => {
      const provider = new CloudflareR2Provider(mockConfig);

      // Test various error scenarios
      mockSend.mockRejectedValueOnce(new Error('Network error'));
      await expect(provider.exists('test-key')).rejects.toThrow('Network error');

      mockSend.mockRejectedValueOnce(new Error('Access denied'));
      await expect(provider.download('test-key')).rejects.toThrow('Access denied');
    });

    test('should handle concurrent operations', async () => {
      mockSend.mockResolvedValue({});

      const provider = new CloudflareR2Provider(mockConfig);

      // Run multiple operations concurrently
      const promises = [provider.exists('key1'), provider.exists('key2'), provider.exists('key3')];

      await Promise.all(promises);

      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    test('should handle ReadableStream conversion errors', async () => {
      // Mock the logger to avoid import issues
      vi.mock('../src/utils/logger', () => ({
        storageLogger: {
          error: vi.fn(),
        },
      }));

      const provider = new CloudflareR2Provider(mockConfig);
      const stream = new ReadableStream({
        start(controller) {
          controller.error(new Error('Stream conversion error'));
        },
      });

      // This should use multipart upload and handle the error
      mockUploadDone.mockRejectedValue(new Error('Stream conversion error'));

      await expect(provider.upload('test-key', stream)).rejects.toThrow('Stream conversion error');
    });
  });
});
