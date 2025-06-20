import { describe, expect, vi, beforeEach, Mock } from 'vitest';
import { CloudflareR2Provider } from '../../providers/cloudflare-r2';
import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';

// Import mocked modules
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS SDK modules
vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');
vi.mock('@aws-sdk/lib-storage');

describe('cloudflareR2Provider', () => {
  let provider: CloudflareR2Provider;
  let mockSend: Mock;

  const mockConfig = {
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret',
    accountId: 'test-account',
    bucket: 'test-bucket',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup S3Client mock
    mockSend = vi.fn();
    (S3Client as any).mockImplementation(() => ({
      send: mockSend,
    }));

    provider = new CloudflareR2Provider(mockConfig);
  });

  describe('constructor', () => {
    test('should initialize with basic config', () => {
      expect(provider).toBeDefined();
      expect(S3Client).toHaveBeenCalledWith({
        credentials: {
          accessKeyId: mockConfig.accessKeyId,
          secretAccessKey: mockConfig.secretAccessKey,
        },
        endpoint: `https://${mockConfig.accountId}.r2.cloudflarestorage.com`,
        region: 'auto',
        forcePathStyle: true,
      });
    });

    test('should initialize with enhanced config', () => {
      const enhancedConfig = {
        ...mockConfig,
        customDomain: 'cdn.example.com',
        defaultPartSize: 10 * 1024 * 1024,
        defaultQueueSize: 6,
      };

      const enhancedProvider = new CloudflareR2Provider(enhancedConfig);
      expect(enhancedProvider).toBeDefined();
    });
  });

  describe('upload', () => {
    test('should use simple upload for small files', async () => {
      const key = 'test-file.txt';
      const data = Buffer.from('test content');

      mockSend.mockResolvedValueOnce({}); // PutObjectCommand
      mockSend.mockResolvedValueOnce({
        // HeadObjectCommand
        ContentType: 'text/plain',
        ContentLength: data.length,
        LastModified: new Date(),
        ETag: '"test-etag"',
      });

      const result = await provider.upload(key, data, {
        contentType: 'text/plain',
      });

      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(result.key).toBe(key);
      expect(result.contentType).toBe('text/plain');
    });

    test('should use multipart upload for large files', async () => {
      const key = 'large-file.bin';
      const largeData = Buffer.alloc(150 * 1024 * 1024); // 150MB

      // Mock Upload class
      const mockDone = vi.fn().mockResolvedValue({
        ETag: '"multipart-etag"',
        VersionId: 'test-version',
      });

      (Upload as any).mockImplementation(() => ({
        done: mockDone,
        on: vi.fn(),
      }));

      mockSend.mockResolvedValueOnce({
        // HeadObjectCommand
        ContentType: 'application/octet-stream',
        ContentLength: largeData.length,
        LastModified: new Date(),
        ETag: '"multipart-etag"',
      });

      const result = await provider.upload(key, largeData);

      expect(Upload).toHaveBeenCalledWith();
      expect(mockDone).toHaveBeenCalledWith();
      expect(result.key).toBe(key);
    });

    test('should track upload progress', async () => {
      const key = 'progress-test.txt';
      const data = Buffer.from('test content');
      const onProgress = vi.fn();

      mockSend.mockResolvedValueOnce({}); // PutObjectCommand
      mockSend.mockResolvedValueOnce({
        // HeadObjectCommand
        ContentType: 'text/plain',
        ContentLength: data.length,
        LastModified: new Date(),
        ETag: '"test-etag"',
      });

      await provider.upload(key, data, { onProgress });

      expect(onProgress).toHaveBeenCalledWith({
        loaded: data.length,
        total: data.length,
        key,
      });
    });

    test('should handle streaming uploads', async () => {
      const key = 'stream-test.txt';
      const stream = new Readable({
        read() {
          this.push('test content');
          this.push(null);
        },
      });

      // Mock multipart upload for streams
      const mockDone = vi.fn().mockResolvedValue({
        ETag: '"stream-etag"',
        VersionId: 'stream-version',
      });

      (Upload as any).mockImplementation(() => ({
        done: mockDone,
        on: vi.fn(),
      }));

      mockSend.mockResolvedValueOnce({
        // HeadObjectCommand
        ContentType: 'application/octet-stream',
        ContentLength: 12,
        LastModified: new Date(),
        ETag: '"stream-etag"',
      });

      const result = await provider.upload(key, stream);

      expect(Upload).toHaveBeenCalledWith();
      expect(result.key).toBe(key);
    });
  });

  describe('presigned URLs', () => {
    test('should generate presigned upload URL', async () => {
      const key = 'upload-test.txt';
      const mockUrl =
        'https://test-bucket.r2.cloudflarestorage.com/upload-test.txt?X-Amz-Signature=...';

      (getSignedUrl as Mock).mockResolvedValue(mockUrl);

      const result = await provider.getPresignedUploadUrl(key, {
        contentType: 'text/plain',
        expiresIn: 3600,
      });

      expect(result.url).toBe(mockUrl);
      expect(result.headers).toEqual({
        'Content-Type': 'text/plain',
      });
      expect(getSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(PutObjectCommand), {
        expiresIn: 3600,
      });
    });

    test('should generate presigned download URL', async () => {
      const key = 'download-test.txt';
      const mockUrl =
        'https://test-bucket.r2.cloudflarestorage.com/download-test.txt?X-Amz-Signature=...';

      (getSignedUrl as Mock).mockResolvedValue(mockUrl);

      const url = await provider.getPresignedDownloadUrl(key, {
        responseContentDisposition: 'attachment; filename="test.txt"',
        expiresIn: 7200,
      });

      expect(url).toBe(mockUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(GetObjectCommand), {
        expiresIn: 7200,
      });
    });

    test('should generate public URL with custom domain', () => {
      const customProvider = new CloudflareR2Provider({
        ...mockConfig,
        customDomain: 'cdn.example.com',
      });

      const url = customProvider.getPublicUrl('test.jpg');
      expect(url).toBe('https://cdn.example.com/test.jpg');
    });

    test('should generate public URL without custom domain', () => {
      const url = provider.getPublicUrl('test.jpg');
      expect(url).toBe('https://pub-test-bucket.r2.dev/test.jpg');
    });
  });

  describe('multipart upload methods', () => {
    test('should create multipart upload', async () => {
      const key = 'multipart-test.bin';
      const uploadId = 'test-upload-id';

      mockSend.mockResolvedValue({
        UploadId: uploadId,
      });

      const result = await provider.createMultipartUpload(key, {
        contentType: 'application/octet-stream',
      });

      expect(result).toBe(uploadId);
      expect(mockSend).toHaveBeenCalledWith(expect.any(CreateMultipartUploadCommand));
    });

    test('should upload part', async () => {
      const key = 'multipart-test.bin';
      const uploadId = 'test-upload-id';
      const partNumber = 1;
      const data = Buffer.from('part data');
      const etag = '"part-etag"';

      mockSend.mockResolvedValue({
        ETag: etag,
      });

      const result = await provider.uploadPart(key, uploadId, partNumber, data);

      expect(result.ETag).toBe(etag);
      expect(mockSend).toHaveBeenCalledWith(expect.any(UploadPartCommand));
    });

    test('should complete multipart upload', async () => {
      const key = 'multipart-test.bin';
      const uploadId = 'test-upload-id';
      const parts = [
        { PartNumber: 1, ETag: '"part1"' },
        { PartNumber: 2, ETag: '"part2"' },
      ];

      mockSend.mockResolvedValue({
        ETag: '"complete-etag"',
        Location: 'https://test-bucket.r2.cloudflarestorage.com/multipart-test.bin',
      });

      const result = await provider.completeMultipartUpload(key, uploadId, parts);

      expect(result.ETag).toBe('"complete-etag"');
      expect(mockSend).toHaveBeenCalledWith(expect.any(CompleteMultipartUploadCommand));
    });

    test('should abort multipart upload', async () => {
      const key = 'multipart-test.bin';
      const uploadId = 'test-upload-id';

      mockSend.mockResolvedValue({});

      await provider.abortMultipartUpload(key, uploadId);

      expect(mockSend).toHaveBeenCalledWith(expect.any(AbortMultipartUploadCommand));
    });

    test('should get presigned URL for part upload', async () => {
      const key = 'multipart-test.bin';
      const uploadId = 'test-upload-id';
      const partNumber = 1;
      const mockUrl =
        'https://test-bucket.r2.cloudflarestorage.com/multipart-test.bin?uploadId=...';

      (getSignedUrl as Mock).mockResolvedValue(mockUrl);

      const url = await provider.getPresignedPartUploadUrl(key, uploadId, partNumber);

      expect(url).toBe(mockUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(expect.any(Object), expect.any(UploadPartCommand), {
        expiresIn: 3600,
      });
    });
  });

  describe('uploadFromUrl', () => {
    test('should upload from URL for small files', async () => {
      const key = 'from-url.jpg';
      const sourceUrl = 'https://example.com/image.jpg';
      const imageData = Buffer.from('fake image data');

      // Mock fetch
      vi.spyOn(global, 'fetch')
        .mockImplementation()
        .mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'image/jpeg',
            'content-length': imageData.length.toString(),
          }),
          arrayBuffer: async () => imageData.buffer,
        });

      mockSend.mockResolvedValueOnce({}); // PutObjectCommand
      mockSend.mockResolvedValueOnce({
        // HeadObjectCommand
        ContentType: 'image/jpeg',
        ContentLength: imageData.length,
        LastModified: new Date(),
        ETag: '"url-etag"',
      });

      const result = await provider.uploadFromUrl(key, sourceUrl);

      expect(result.key).toBe(key);
      expect(result.contentType).toBe('image/jpeg');
      expect(global.fetch).toHaveBeenCalledWith(sourceUrl);
    });

    test('should use streaming for large files from URL', async () => {
      const key = 'large-from-url.bin';
      const sourceUrl = 'https://example.com/large.bin';
      const largeSize = 150 * 1024 * 1024; // 150MB

      // Mock fetch with stream
      const mockStream = new ReadableStream();
      vi.spyOn(global, 'fetch')
        .mockImplementation()
        .mockResolvedValue({
          ok: true,
          headers: new Headers({
            'content-type': 'application/octet-stream',
            'content-length': largeSize.toString(),
          }),
          body: mockStream,
        });

      // Mock multipart upload
      const mockDone = vi.fn().mockResolvedValue({
        ETag: '"stream-url-etag"',
        VersionId: 'stream-url-version',
      });

      (Upload as any).mockImplementation(() => ({
        done: mockDone,
        on: vi.fn(),
      }));

      mockSend.mockResolvedValueOnce({
        // HeadObjectCommand
        ContentType: 'application/octet-stream',
        ContentLength: largeSize,
        LastModified: new Date(),
        ETag: '"stream-url-etag"',
      });

      const result = await provider.uploadFromUrl(key, sourceUrl);

      expect(Upload).toHaveBeenCalledWith();
      expect(result.key).toBe(key);
    });

    test('should handle failed URL fetch', async () => {
      const key = 'failed-url.txt';
      const sourceUrl = 'https://example.com/404.txt';

      vi.spyOn(global, 'fetch').mockImplementation().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(provider.uploadFromUrl(key, sourceUrl)).rejects.toThrow(
        'Failed to fetch from URL: Not Found',
      );
    });
  });

  describe('error handling', () => {
    test('should handle multipart upload creation failure', async () => {
      const key = 'fail-multipart.bin';

      mockSend.mockResolvedValue({
        // No UploadId in response
      });

      await expect(provider.createMultipartUpload(key)).rejects.toThrow(
        'Failed to create multipart upload',
      );
    });

    test('should handle and log multipart upload failure', async () => {
      const key = 'fail-upload.bin';
      const largeData = Buffer.alloc(150 * 1024 * 1024);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockError = new Error('Upload failed');
      (Upload as any).mockImplementation(() => ({
        done: vi.fn().mockRejectedValue(mockError),
        on: vi.fn(),
      }));

      await expect(provider.upload(key, largeData)).rejects.toThrow('Upload failed');
      expect(consoleSpy).toHaveBeenCalledWith('Multipart upload failed:', mockError);

      consoleSpy.mockRestore();
    });
  });

  describe('streaming', () => {
    test('should download as stream', async () => {
      const key = 'stream-download.txt';
      const mockWebStream = new ReadableStream();

      mockSend.mockResolvedValue({
        Body: {
          transformToWebStream: () => mockWebStream,
        },
      });

      const stream = await provider.downloadStream(key);

      expect(stream).toBe(mockWebStream);
      expect(mockSend).toHaveBeenCalledWith(expect.any(GetObjectCommand));
    });

    test('should handle missing body in download stream', async () => {
      const key = 'no-body.txt';

      mockSend.mockResolvedValue({
        Body: null,
      });

      await expect(provider.downloadStream(key)).rejects.toThrow('No body in response');
    });
  });
});
