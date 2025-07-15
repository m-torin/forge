import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  ClientMultipartUpload,
  downloadFromUrl,
  splitFileIntoChunks,
  uploadDirectToUrl,
  uploadWithPresignedUrl,
} from '../src/client-utils';

describe('client-utils', () => {
  let mockXHR: any;
  let originalXMLHttpRequest: any;

  beforeEach(() => {
    // Mock XMLHttpRequest
    mockXHR = {
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      upload: {
        addEventListener: vi.fn(),
      },
      addEventListener: vi.fn(),
      status: 200,
    };

    originalXMLHttpRequest = global.XMLHttpRequest;
    global.XMLHttpRequest = vi.fn(() => mockXHR) as any;

    // Mock fetch
    vi.spyOn(global, 'fetch').mockImplementation();
  });

  afterEach(() => {
    global.XMLHttpRequest = originalXMLHttpRequest;
    vi.restoreAllMocks();
  });

  describe('uploadWithPresignedUrl', () => {
    test('should upload with POST and form data', async () => {
      const presignedData = {
        url: 'https://bucket.s3.amazonaws.com/',
        fields: {
          key: 'test-file.txt',
          policy: 'test-policy',
          signature: 'test-signature',
        },
        key: 'test-file.txt',
        expiresAt: new Date(Date.now() + 3600000),
      };

      const file = new Blob(['test content'], { type: 'text/plain' });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 204,
      });

      await uploadWithPresignedUrl(presignedData, file);

      expect(global.fetch).toHaveBeenCalledWith(
        presignedData.url,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
    });

    test('should track upload progress with XMLHttpRequest', async () => {
      const presignedData = {
        url: 'https://bucket.s3.amazonaws.com/',
        fields: { key: 'test-file.txt' },
        key: 'test-file.txt',
        expiresAt: new Date(Date.now() + 3600000),
      };

      const file = new Blob(['test content'], { type: 'text/plain' });
      const onProgress = vi.fn();

      // Simulate progress event
      mockXHR.upload.addEventListener.mockImplementation((event: string, handler: Function) => {
        if (event === 'progress') {
          setTimeout(() => {
            handler({
              lengthComputable: true,
              loaded: 6,
              total: 12,
            });
          }, 10);
        }
      });

      // Simulate successful upload
      mockXHR.addEventListener.mockImplementation((event: string, handler: Function) => {
        if (event === 'load') {
          setTimeout(() => {
            mockXHR.status = 200;
            handler();
          }, 20);
        }
      });

      await uploadWithPresignedUrl(presignedData, file, { onProgress });

      expect(onProgress).toHaveBeenCalledWith({
        loaded: 6,
        total: 12,
        percent: 50,
      });
    });

    test('should handle upload failure', async () => {
      const presignedData = {
        url: 'https://bucket.s3.amazonaws.com/',
        fields: {},
        key: 'test-file.txt',
        expiresAt: new Date(Date.now() + 3600000),
      };

      const file = new Blob(['test content'], { type: 'text/plain' });

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(uploadWithPresignedUrl(presignedData, file)).rejects.toThrow(
        'Upload failed with status 403',
      );
    });
  });

  describe('uploadDirectToUrl', () => {
    test('should upload with PUT method', async () => {
      const url = 'https://bucket.s3.amazonaws.com/test-file.txt?signature=...';
      const file = new Blob(['test content'], { type: 'text/plain' });
      const headers = {
        'Content-Type': 'text/plain',
        'x-amz-acl': 'public-read',
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
      });

      await uploadDirectToUrl(url, file, { headers });

      expect(global.fetch).toHaveBeenCalledWith(url, {
        method: 'PUT',
        body: file,
        headers,
      });
    });

    test('should track progress with XMLHttpRequest', async () => {
      const url = 'https://bucket.s3.amazonaws.com/test-file.txt?signature=...';
      const file = new Blob(['test content'], { type: 'text/plain' });
      const onProgress = vi.fn();

      // Simulate progress event
      mockXHR.upload.addEventListener.mockImplementation((event: string, handler: Function) => {
        if (event === 'progress') {
          setTimeout(() => {
            handler({
              lengthComputable: true,
              loaded: 8,
              total: 12,
            });
          }, 10);
        }
      });

      // Simulate successful upload
      mockXHR.addEventListener.mockImplementation((event: string, handler: Function) => {
        if (event === 'load') {
          setTimeout(() => {
            mockXHR.status = 200;
            handler();
          }, 20);
        }
      });

      await uploadDirectToUrl(url, file, { onProgress });

      expect(onProgress).toHaveBeenCalledWith({
        loaded: 8,
        total: 12,
        percent: (8 / 12) * 100,
      });
      expect(mockXHR.open).toHaveBeenCalledWith('PUT', url);
    });

    test('should handle network error', async () => {
      const url = 'https://bucket.s3.amazonaws.com/test-file.txt';
      const file = new Blob(['test content']);
      const onProgress = vi.fn();

      // Simulate error event
      mockXHR.addEventListener.mockImplementation((event: string, handler: Function) => {
        if (event === 'error') {
          setTimeout(() => handler(), 10);
        }
      });

      await expect(uploadDirectToUrl(url, file, { onProgress })).rejects.toThrow('Upload failed');
    });
  });

  describe('clientMultipartUpload', () => {
    test('should manage multipart upload parts', async () => {
      const uploadId = 'test-upload-id';
      const key = 'large-file.bin';
      const upload = new ClientMultipartUpload(uploadId, key);

      expect(upload.getUploadId()).toBe(uploadId);
      expect(upload.getKey()).toBe(key);

      // Mock successful part upload
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          ETag: '"part1-etag"',
        }),
      });

      const partData = new Blob(['part 1 data']);
      await upload.uploadPart(1, 'https://presigned-url-part-1', partData);

      const parts = upload.getParts();
      expect(parts).toHaveLength(1);
      expect(parts[0]).toStrictEqual({
        PartNumber: 1,
        ETag: '"part1-etag"',
      });
    });

    test('should sort parts by part number', async () => {
      const upload = new ClientMultipartUpload('upload-id', 'file.bin');

      // Mock part uploads
      (global.fetch as any).mockImplementation(() => ({
        ok: true,
        status: 200,
        headers: new Headers({
          ETag: '"etag"',
        }),
      }));

      // Upload parts out of order
      await upload.uploadPart(3, 'url-3', new Blob(['part 3']));
      await upload.uploadPart(1, 'url-1', new Blob(['part 1']));
      await upload.uploadPart(2, 'url-2', new Blob(['part 2']));

      const parts = upload.getParts();
      expect(parts.map(p => p.PartNumber)).toStrictEqual([1, 2, 3]);
    });

    test('should handle part upload failure', async () => {
      const upload = new ClientMultipartUpload('upload-id', 'file.bin');

      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(upload.uploadPart(1, 'https://failed-url', new Blob(['data']))).rejects.toThrow(
        'Part upload failed with status 500',
      );
    });
  });

  describe('splitFileIntoChunks', () => {
    test('should split file into chunks', async () => {
      const fileSize = 15 * 1024 * 1024; // 15MB
      const chunkSize = 5 * 1024 * 1024; // 5MB
      const file = new Blob([new ArrayBuffer(fileSize)]);

      const chunks = [];
      for await (const chunk of splitFileIntoChunks(file, chunkSize)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toStrictEqual({
        chunk: expect.any(Blob),
        partNumber: 1,
        start: 0,
        end: chunkSize,
      });
      expect(chunks[1]).toStrictEqual({
        chunk: expect.any(Blob),
        partNumber: 2,
        start: chunkSize,
        end: 2 * chunkSize,
      });
      expect(chunks[2]).toStrictEqual({
        chunk: expect.any(Blob),
        partNumber: 3,
        start: 2 * chunkSize,
        end: fileSize,
      });
    });

    test('should handle file smaller than chunk size', async () => {
      const file = new Blob(['small content']);
      const chunks = [];

      for await (const chunk of splitFileIntoChunks(file, 1024 * 1024)) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0].partNumber).toBe(1);
      expect(chunks[0].start).toBe(0);
      expect(chunks[0].end).toBe(file.size);
    });
  });

  describe('downloadFromUrl', () => {
    test('should download file without progress tracking', async () => {
      const mockBlob = new Blob(['downloaded content'], { type: 'text/plain' });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        blob: async () => mockBlob,
      });

      const result = await downloadFromUrl('https://example.com/file.txt');

      expect(result).toBe(mockBlob);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/file.txt');
    });

    test('should download with progress tracking', async () => {
      const onProgress = vi.fn();
      const chunks = [
        new Uint8Array([1, 2, 3]),
        new Uint8Array([4, 5, 6]),
        new Uint8Array([7, 8, 9]),
      ];

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({ done: false, value: chunks[0] })
          .mockResolvedValueOnce({ done: false, value: chunks[1] })
          .mockResolvedValueOnce({ done: false, value: chunks[2] })
          .mockResolvedValueOnce({ done: true }),
      };

      const mockStream = {
        getReader: () => mockReader,
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-length': '9',
          'content-type': 'application/octet-stream',
        }),
        body: mockStream,
      });

      const result = await downloadFromUrl('https://example.com/file.bin', { onProgress });

      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenNthCalledWith(1, {
        loaded: 3,
        total: 9,
        percent: (3 / 9) * 100,
      });
      expect(onProgress).toHaveBeenNthCalledWith(2, {
        loaded: 6,
        total: 9,
        percent: (6 / 9) * 100,
      });
      expect(onProgress).toHaveBeenNthCalledWith(3, {
        loaded: 9,
        total: 9,
        percent: 100,
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/octet-stream');
    });

    test('should handle download failure', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(downloadFromUrl('https://example.com/404.txt')).rejects.toThrow(
        'Download failed with status 404',
      );
    });

    test('should handle missing content-length header', async () => {
      const onProgress = vi.fn();
      const chunk = new Uint8Array([1, 2, 3, 4, 5]);

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({ done: false, value: chunk })
          .mockResolvedValueOnce({ done: true }),
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'text/plain',
        }),
        body: {
          getReader: () => mockReader,
        },
      });

      const result = await downloadFromUrl('https://example.com/file.txt', { onProgress });

      // Progress should not be called when content-length is missing (total = 0)
      expect(onProgress).not.toHaveBeenCalled();

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/plain');
    });
  });
});
