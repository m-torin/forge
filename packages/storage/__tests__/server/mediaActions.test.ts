import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the server module
const mockGetStorage = vi.fn();
const mockGetMultiStorage = vi.fn();

vi.mock('../../src/server', () => ({
  getStorage: mockGetStorage,
  getMultiStorage: mockGetMultiStorage,
}));

describe('mediaActions', () => {
  let mockStorage: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock storage provider
    mockStorage = {
      upload: vi.fn(),
      download: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      getMetadata: vi.fn(),
      getUrl: vi.fn(),
      list: vi.fn(),
    };

    mockGetStorage.mockReturnValue(mockStorage);
  });

  describe('uploadMediaAction', () => {
    test('should upload media successfully', async () => {
      const mockResult = {
        key: 'test-file.jpg',
        url: 'https://example.com/test-file.jpg',
        size: 1024,
        contentType: 'image/jpeg',
      };
      mockStorage.upload.mockResolvedValue(mockResult);

      const { uploadMediaAction } = await import('../../src/actions/mediaActions');
      const result = await uploadMediaAction('test-file.jpg', Buffer.from('test'));

      expect(result.success).toBeTruthy();
      expect(result.data).toStrictEqual(mockResult);
      expect(mockStorage.upload).toHaveBeenCalledWith(
        'test-file.jpg',
        Buffer.from('test'),
        undefined,
      );
    });

    test('should handle upload errors', async () => {
      mockStorage.upload.mockRejectedValue(new Error('Upload failed'));

      const { uploadMediaAction } = await import('../../src/actions/mediaActions');
      const result = await uploadMediaAction('test-file.jpg', Buffer.from('test'));

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Upload failed');
    });
  });

  describe('getMediaAction', () => {
    test('should get media metadata successfully', async () => {
      const mockMetadata = {
        key: 'test-file.jpg',
        url: 'https://example.com/test-file.jpg',
        size: 1024,
        contentType: 'image/jpeg',
      };
      mockStorage.getMetadata.mockResolvedValue(mockMetadata);

      const { getMediaAction } = await import('../../src/actions/mediaActions');
      const result = await getMediaAction('test-file.jpg');

      expect(result.success).toBeTruthy();
      expect(result.data).toStrictEqual(mockMetadata);
      expect(mockStorage.getMetadata).toHaveBeenCalledWith('test-file.jpg');
    });

    test('should handle metadata errors', async () => {
      mockStorage.getMetadata.mockRejectedValue(new Error('File not found'));

      const { getMediaAction } = await import('../../src/actions/mediaActions');
      const result = await getMediaAction('test-file.jpg');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('File not found');
    });
  });

  describe('listMediaAction', () => {
    test('should list media files successfully', async () => {
      const mockFiles = [
        { key: 'file1.jpg', url: 'https://example.com/file1.jpg', size: 1024 },
        { key: 'file2.jpg', url: 'https://example.com/file2.jpg', size: 2048 },
      ];
      mockStorage.list.mockResolvedValue(mockFiles);

      const { listMediaAction } = await import('../../src/actions/mediaActions');
      const result = await listMediaAction({ limit: 10 });

      expect(result.success).toBeTruthy();
      expect(result.data).toStrictEqual(mockFiles);
      expect(mockStorage.list).toHaveBeenCalledWith({ limit: 10 });
    });

    test('should handle list errors', async () => {
      mockStorage.list.mockRejectedValue(new Error('List failed'));

      const { listMediaAction } = await import('../../src/actions/mediaActions');
      const result = await listMediaAction();

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('List failed');
    });
  });

  describe('deleteMediaAction', () => {
    test('should delete media successfully', async () => {
      mockStorage.delete.mockResolvedValue(undefined);

      const { deleteMediaAction } = await import('../../src/actions/mediaActions');
      const result = await deleteMediaAction('test-file.jpg');

      expect(result.success).toBeTruthy();
      expect(mockStorage.delete).toHaveBeenCalledWith('test-file.jpg');
    });

    test('should handle delete errors', async () => {
      mockStorage.delete.mockRejectedValue(new Error('Delete failed'));

      const { deleteMediaAction } = await import('../../src/actions/mediaActions');
      const result = await deleteMediaAction('test-file.jpg');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('existsMediaAction', () => {
    test('should check existence successfully', async () => {
      mockStorage.exists.mockResolvedValue(true);

      const { existsMediaAction } = await import('../../src/actions/mediaActions');
      const result = await existsMediaAction('test-file.jpg');

      expect(result.success).toBeTruthy();
      expect(result.data).toBeTruthy();
      expect(mockStorage.exists).toHaveBeenCalledWith('test-file.jpg');
    });

    test('should handle existence check errors', async () => {
      mockStorage.exists.mockRejectedValue(new Error('Check failed'));

      const { existsMediaAction } = await import('../../src/actions/mediaActions');
      const result = await existsMediaAction('test-file.jpg');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Check failed');
    });
  });

  describe('getMediaUrlAction', () => {
    test('should get signed URL for product photos', async () => {
      mockStorage.getUrl.mockResolvedValue('https://example.com/signed-url');

      const { getMediaUrlAction } = await import('../../src/actions/mediaActions');
      const result = await getMediaUrlAction('products/123/photo.jpg', {
        context: 'product',
        expiresIn: 3600,
      });

      expect(result.success).toBeTruthy();
      expect(result.data).toBe('https://example.com/signed-url');
      expect(mockStorage.getUrl).toHaveBeenCalledWith('products/123/photo.jpg', {
        expiresIn: 3600,
      });
    });

    test('should get direct URL for public content', async () => {
      mockStorage.getUrl.mockResolvedValue('https://example.com/public-url');

      const { getMediaUrlAction } = await import('../../src/actions/mediaActions');
      const result = await getMediaUrlAction('public/file.jpg', { context: 'public' });

      expect(result.success).toBeTruthy();
      expect(result.data).toBe('https://example.com/public-url');
      expect(mockStorage.getUrl).toHaveBeenCalledWith('public/file.jpg');
    });

    test('should handle URL generation errors', async () => {
      mockStorage.getUrl.mockRejectedValue(new Error('URL generation failed'));

      const { getMediaUrlAction } = await import('../../src/actions/mediaActions');
      const result = await getMediaUrlAction('test-file.jpg');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('URL generation failed');
    });
  });

  describe('downloadMediaAction', () => {
    test('should download media successfully', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/plain' });
      mockStorage.download.mockResolvedValue(mockBlob);

      const { downloadMediaAction } = await import('../../src/actions/mediaActions');
      const result = await downloadMediaAction('test-file.jpg');

      expect(result.success).toBeTruthy();
      expect(result.data).toBe(mockBlob);
      expect(mockStorage.download).toHaveBeenCalledWith('test-file.jpg');
    });

    test('should handle download errors', async () => {
      mockStorage.download.mockRejectedValue(new Error('Download failed'));

      const { downloadMediaAction } = await import('../../src/actions/mediaActions');
      const result = await downloadMediaAction('test-file.jpg');

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Download failed');
    });
  });

  describe('bulkDeleteMediaAction', () => {
    test('should bulk delete media successfully', async () => {
      mockStorage.delete.mockResolvedValue(undefined);

      const { bulkDeleteMediaAction } = await import('../../src/actions/mediaActions');
      const result = await bulkDeleteMediaAction(['file1.jpg', 'file2.jpg']);

      expect(result.success).toBeTruthy();
      expect(result.data?.succeeded).toStrictEqual(['file1.jpg', 'file2.jpg']);
      expect(result.data?.failed).toStrictEqual([]);
      expect(mockStorage.delete).toHaveBeenCalledTimes(2);
    });

    test('should handle partial bulk delete failures', async () => {
      mockStorage.delete
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Delete failed'));

      const { bulkDeleteMediaAction } = await import('../../src/actions/mediaActions');
      const result = await bulkDeleteMediaAction(['file1.jpg', 'file2.jpg']);

      expect(result.success).toBeFalsy();
      expect(result.data?.succeeded).toStrictEqual(['file1.jpg']);
      expect(result.data?.failed).toHaveLength(1);
      expect(result.data?.failed[0].key).toBe('file2.jpg');
      expect(result.data?.failed[0].error).toBe('Delete failed');
    });
  });

  describe('listProvidersAction', () => {
    test('should list providers successfully', async () => {
      const mockMultiStorage = {
        getProviderNames: vi.fn().mockReturnValue(['provider1', 'provider2']),
      };
      mockGetMultiStorage.mockReturnValue(mockMultiStorage);

      const { listProvidersAction } = await import('../../src/actions/mediaActions');
      const result = await listProvidersAction();

      expect(result.success).toBeTruthy();
      expect(result.data).toStrictEqual(['provider1', 'provider2']);
    });

    test('should handle provider list errors', async () => {
      const mockMultiStorage = {
        getProviderNames: vi.fn().mockImplementation(() => {
          throw new Error('Provider list failed');
        }),
      };
      mockGetMultiStorage.mockReturnValue(mockMultiStorage);

      const { listProvidersAction } = await import('../../src/actions/mediaActions');
      const result = await listProvidersAction();

      expect(result.success).toBeFalsy();
      expect(result.error).toBe('Provider list failed');
    });
  });
});
