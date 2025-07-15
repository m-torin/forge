import { beforeEach, describe, expect, vi } from 'vitest';

// Mock Vercel Blob SDK
const mockPut = vi.fn();
const mockDel = vi.fn();
const mockHead = vi.fn();
const mockList = vi.fn();

vi.mock('@vercel/blob', () => ({
  del: mockDel,
  head: mockHead,
  list: mockList,
  put: mockPut,
}));

// Mock fetch for download method
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('vercelBlobProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Reset fetch mock to ensure clean state
    mockFetch.mockReset();
  });

  describe('constructor', () => {
    test('should create provider with valid token', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      expect(provider).toBeDefined();
    });

    test('should throw error when token is missing', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      expect(() => new VercelBlobProvider('')).toThrow('Vercel Blob token is required');
      expect(() => new VercelBlobProvider(null as any)).toThrow('Vercel Blob token is required');
      expect(() => new VercelBlobProvider(undefined as any)).toThrow(
        'Vercel Blob token is required',
      );
    });
  });

  describe('upload', () => {
    beforeEach(() => {
      mockPut.mockResolvedValue({
        pathname: 'test-key',
        url: 'https://blob.vercel.com/test-key',
      });

      mockHead.mockResolvedValue({
        contentType: 'text/plain',
        size: 1024,
        uploadedAt: '2023-01-01T00:00:00Z',
      });
    });

    test('should upload Buffer data successfully', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const buffer = Buffer.from('test data');

      const result = await provider.upload('test-key', buffer, {
        cacheControl: 3600,
        contentType: 'text/plain',
      });

      expect(mockPut).toHaveBeenCalledWith('test-key', buffer, {
        access: 'public',
        addRandomSuffix: false,
        cacheControlMaxAge: 3600,
        contentType: 'text/plain',
        token: 'test-token',
      });

      expect(mockHead).toHaveBeenCalledWith('https://blob.vercel.com/test-key', {
        token: 'test-token',
      });

      expect(result).toStrictEqual({
        url: 'https://blob.vercel.com/test-key',
        contentType: 'text/plain',
        etag: undefined,
        key: 'test-key',
        lastModified: new Date('2023-01-01T00:00:00Z'),
        size: 1024,
      });
    });

    test('should upload Blob data successfully', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const blob = new Blob(['test data'], { type: 'text/plain' });

      const result = await provider.upload('test-key', blob);

      expect(mockPut).toHaveBeenCalledWith('test-key', blob, {
        access: 'public',
        addRandomSuffix: false,
        cacheControlMaxAge: undefined,
        contentType: undefined,
        token: 'test-token',
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://blob.vercel.com/test-key');
    });

    test('should upload File data successfully', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const file = new File(['test data'], 'test.txt', { type: 'text/plain' });

      const result = await provider.upload('test-key', file);

      expect(mockPut).toHaveBeenCalledWith('test-key', file, expect.any(Object));
      expect(result).toBeDefined();
    });

    test('should upload ArrayBuffer data successfully', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const arrayBuffer = new ArrayBuffer(8);

      const result = await provider.upload('test-key', arrayBuffer);

      expect(mockPut).toHaveBeenCalledWith('test-key', arrayBuffer, expect.any(Object));
      expect(result).toBeDefined();
    });

    test('should upload ReadableStream data successfully', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([1, 2, 3, 4]));
          controller.close();
        },
      });

      const result = await provider.upload('test-key', stream);

      expect(mockPut).toHaveBeenCalledWith('test-key', stream, expect.any(Object));
      expect(result).toBeDefined();
    });

    test('should handle upload without options', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const buffer = Buffer.from('test data');

      await provider.upload('test-key', buffer);

      expect(mockPut).toHaveBeenCalledWith('test-key', buffer, {
        access: 'public',
        addRandomSuffix: false,
        cacheControlMaxAge: undefined,
        contentType: undefined,
        token: 'test-token',
      });
    });

    test('should handle put API errors', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockPut.mockRejectedValue(new Error('Vercel API error'));

      const provider = new VercelBlobProvider('test-token');
      const buffer = Buffer.from('test data');

      await expect(provider.upload('test-key', buffer)).rejects.toThrow('Vercel API error');
    });

    test('should handle head API errors after successful put', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockHead.mockRejectedValue(new Error('Head request failed'));

      const provider = new VercelBlobProvider('test-token');
      const buffer = Buffer.from('test data');

      await expect(provider.upload('test-key', buffer)).rejects.toThrow('Head request failed');
    });
  });

  describe('download', () => {
    test('should download blob successfully', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const mockBlob = new Blob(['test data'], { type: 'text/plain' });
      mockFetch.mockResolvedValueOnce({
        blob: () => Promise.resolve(mockBlob),
        ok: true,
      });

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.download('https://test-blob.vercel-storage.com/test-key');

      expect(mockFetch).toHaveBeenCalledWith('https://test-blob.vercel-storage.com/test-key', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(result).toBe(mockBlob);
    });

    test('should handle download errors', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const provider = new VercelBlobProvider('test-token');

      await expect(
        provider.download('https://test-blob.vercel-storage.com/test-key'),
      ).rejects.toThrow('Failed to download blob: Not Found');
    });

    test('should handle fetch network errors', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const provider = new VercelBlobProvider('test-token');

      await expect(
        provider.download('https://test-blob.vercel-storage.com/test-key'),
      ).rejects.toThrow('Network error');
    });
  });

  describe('delete', () => {
    test('should delete blob successfully', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockDel.mockResolvedValue(undefined);

      const provider = new VercelBlobProvider('test-token');
      await provider.delete('test-key');

      expect(mockDel).toHaveBeenCalledWith('test-key', {
        token: 'test-token',
      });
    });

    test('should handle delete errors', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockDel.mockRejectedValue(new Error('Delete failed'));

      const provider = new VercelBlobProvider('test-token');

      await expect(provider.delete('test-key')).rejects.toThrow('Delete failed');
    });
  });

  describe('exists', () => {
    test('should return true when blob exists', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockHead.mockResolvedValue({
        contentType: 'text/plain',
        size: 1024,
        uploadedAt: '2023-01-01T00:00:00Z',
      });

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.exists('test-key');

      expect(mockHead).toHaveBeenCalledWith('test-key', {
        token: 'test-token',
      });

      expect(result).toBeTruthy();
    });

    test('should return false when blob does not exist', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockHead.mockRejectedValue(new Error('Not found'));

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.exists('test-key');

      expect(result).toBeFalsy();
    });

    test('should return false for any head request error', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockHead.mockRejectedValue(new Error('Network timeout'));

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.exists('test-key');

      expect(result).toBeFalsy();
    });
  });

  describe('list', () => {
    beforeEach(() => {
      mockList.mockResolvedValue({
        blobs: [
          {
            pathname: 'file1.txt',
            url: 'https://blob.vercel.com/file1.txt',
            size: 1024,
            uploadedAt: '2023-01-01T00:00:00Z',
          },
          {
            pathname: 'file2.txt',
            url: 'https://blob.vercel.com/file2.txt',
            size: 2048,
            uploadedAt: '2023-01-02T00:00:00Z',
          },
        ],
      });

      mockHead.mockImplementation((url: any) => {
        if (url.includes('file1.txt')) {
          return Promise.resolve({
            contentType: 'text/plain',
            size: 1024,
            uploadedAt: '2023-01-01T00:00:00Z',
          });
        }
        if (url.includes('file2.txt')) {
          return Promise.resolve({
            contentType: 'text/plain',
            size: 2048,
            uploadedAt: '2023-01-02T00:00:00Z',
          });
        }
        return Promise.reject(new Error('Not found'));
      });
    });

    test('should list blobs successfully', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.list();

      expect(mockList).toHaveBeenCalledWith({
        cursor: undefined,
        limit: undefined,
        prefix: undefined,
        token: 'test-token',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toStrictEqual({
        url: 'https://blob.vercel.com/file1.txt',
        contentType: 'text/plain',
        etag: undefined,
        key: 'file1.txt',
        lastModified: new Date('2023-01-01T00:00:00Z'),
        size: 1024,
      });
      expect(result[1]).toStrictEqual({
        url: 'https://blob.vercel.com/file2.txt',
        contentType: 'text/plain',
        etag: undefined,
        key: 'file2.txt',
        lastModified: new Date('2023-01-02T00:00:00Z'),
        size: 2048,
      });
    });

    test('should list blobs with options', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.list({
        cursor: 'next-cursor',
        limit: 10,
        prefix: 'documents/',
      });

      expect(mockList).toHaveBeenCalledWith({
        cursor: 'next-cursor',
        limit: 10,
        prefix: 'documents/',
        token: 'test-token',
      });

      expect(result).toHaveLength(2);
    });

    test('should handle empty list results', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockList.mockResolvedValue({ blobs: [] });

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.list();

      expect(result).toStrictEqual([]);
    });

    test('should handle list API errors', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockList.mockRejectedValue(new Error('List failed'));

      const provider = new VercelBlobProvider('test-token');

      await expect(provider.list()).rejects.toThrow('List failed');
    });

    test('should handle head errors for individual blobs during list', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockHead.mockRejectedValue(new Error('Head failed'));

      const provider = new VercelBlobProvider('test-token');

      await expect(provider.list()).rejects.toThrow('Head failed');
    });
  });

  describe('getUrl', () => {
    beforeEach(() => {
      mockHead.mockResolvedValue({
        url: 'https://blob.vercel.com/test-key',
        contentType: 'text/plain',
        size: 1024,
        uploadedAt: '2023-01-01T00:00:00Z',
      });
    });

    test('should get URL for blob', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.getUrl('test-key');

      expect(mockHead).toHaveBeenCalledWith('test-key', {
        token: 'test-token',
      });

      expect(result).toBe('https://blob.vercel.com/test-key');
    });

    test('should get URL with expiration options (ignored for Vercel)', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.getUrl('test-key', { expiresIn: 3600 });

      expect(result).toBe('https://blob.vercel.com/test-key');
    });

    test('should handle getUrl errors', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockHead.mockRejectedValue(new Error('Blob not found'));

      const provider = new VercelBlobProvider('test-token');

      await expect(provider.getUrl('test-key')).rejects.toThrow('Blob not found');
    });
  });

  describe('getMetadata', () => {
    beforeEach(() => {
      mockHead.mockResolvedValue({
        pathname: 'test-key',
        url: 'https://blob.vercel.com/test-key',
        contentType: 'application/json',
        size: 2048,
        uploadedAt: '2023-01-01T12:00:00Z',
      });
    });

    test('should get metadata for blob', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.getMetadata('test-key');

      expect(mockHead).toHaveBeenCalledWith('test-key', {
        token: 'test-token',
      });

      expect(result).toStrictEqual({
        url: 'https://blob.vercel.com/test-key',
        contentType: 'application/json',
        etag: undefined,
        key: 'test-key',
        lastModified: new Date('2023-01-01T12:00:00Z'),
        size: 2048,
      });
    });

    test('should handle missing contentType in metadata', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockHead.mockResolvedValue({
        pathname: 'test-key',
        url: 'https://blob.vercel.com/test-key',
        size: 2048,
        uploadedAt: '2023-01-01T12:00:00Z',
      });

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.getMetadata('test-key');

      expect(result.contentType).toBeUndefined();
    });

    test('should handle getMetadata errors', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockHead.mockRejectedValue(new Error('Metadata not found'));

      const provider = new VercelBlobProvider('test-token');

      await expect(provider.getMetadata('test-key')).rejects.toThrow('Metadata not found');
    });
  });

  describe('error handling and edge cases', () => {
    test('should handle API responses with missing fields', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockPut.mockResolvedValue({
        pathname: 'test-key',
        url: 'https://blob.vercel.com/test-key',
      });

      mockHead.mockResolvedValue({
        size: 1024,
        uploadedAt: '2023-01-01T00:00:00Z',
      });

      const provider = new VercelBlobProvider('test-token');
      const result = await provider.upload('test-key', Buffer.from('test'));

      expect(result.contentType).toBeUndefined();
      expect(result.etag).toBeUndefined();
    });

    test('should handle concurrent operations', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      mockHead.mockResolvedValue({
        contentType: 'text/plain',
        size: 1024,
        uploadedAt: '2023-01-01T00:00:00Z',
      });

      const provider = new VercelBlobProvider('test-token');

      // Multiple concurrent exists checks
      const promises = Array.from({ length: 5 }, (_, i) => provider.exists(`test-key-${i}`));

      const results = await Promise.all(promises);
      expect(results).toStrictEqual([true, true, true, true, true]);
      expect(mockHead).toHaveBeenCalledTimes(5);
    });

    test('should handle token in different request types', async () => {
      const { VercelBlobProvider } = await import('../../../providers/vercel-blob');

      const provider = new VercelBlobProvider('secret-token-123');

      mockHead.mockResolvedValue({
        contentType: 'text/plain',
        size: 1024,
        uploadedAt: '2023-01-01T00:00:00Z',
      });

      // Reset any previous mock configurations
      mockDel.mockResolvedValue(undefined);

      await provider.exists('test-key');

      expect(mockHead).toHaveBeenCalledWith('test-key', {
        token: 'secret-token-123',
      });

      await provider.delete('test-key');

      expect(mockDel).toHaveBeenCalledWith('test-key', {
        token: 'secret-token-123',
      });
    });
  });
});
