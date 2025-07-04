import { describe, expect, vi, beforeEach } from 'vitest';
import { CloudflareImagesProvider } from '../providers/cloudflare-images';

// Mock fetch globally
// vi.spyOn(global, 'fetch').mockImplementation();
vi.spyOn(global, 'fetch').mockImplementation();

describe('cloudflareImagesProvider', () => {
  let provider: CloudflareImagesProvider;
  const mockConfig = {
    accountId: 'test-account-id',
    apiToken: 'test-api-token',
    deliveryUrl: 'https://imagedelivery.net/test-account',
    signingKey: 'test-signing-key',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new CloudflareImagesProvider(mockConfig);
  });

  describe('upload', () => {
    test('should upload an image successfully', async () => {
      const mockResponse = {
        success: true,
        result: {
          id: 'test-image-id',
          filename: 'test.jpg',
          uploaded: '2024-01-01T00:00:00Z',
          requireSignedURLs: false,
          variants: ['https://imagedelivery.net/test-account/test-image-id/public'],
        },
        errors: [],
        messages: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await provider.upload('test-image-id', file, {
        contentType: 'image/jpeg',
        requireSignedURLs: false,
      });

      expect(result).toEqual({
        key: 'test-image-id',
        url: 'https://imagedelivery.net/test-account/test-image-id/public',
        size: 4, // Size of "test" string
        contentType: 'image/*',
        lastModified: new Date('2024-01-01T00:00:00Z'),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/test-account-id/images/v1',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-api-token',
          },
          body: expect.any(FormData),
        }),
      );
    });

    test('should handle upload errors', async () => {
      const mockResponse = {
        success: false,
        errors: [{ code: 10001, message: 'Unauthorized' }],
        messages: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse,
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await expect(provider.upload('test-image-id', file)).rejects.toThrow(
        'Cloudflare Images API error: Unauthorized',
      );
    });
  });

  describe('delete', () => {
    test('should delete an image successfully', async () => {
      const mockResponse = {
        success: true,
        result: {},
        errors: [],
        messages: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await provider.delete('test-image-id');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/test-account-id/images/v1/test-image-id',
        expect.objectContaining({
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer test-api-token',
          },
        }),
      );
    });
  });

  describe('getMetadata', () => {
    test('should get image metadata successfully', async () => {
      const mockResponse = {
        success: true,
        result: {
          id: 'test-image-id',
          filename: 'test.jpg',
          uploaded: '2024-01-01T00:00:00Z',
          requireSignedURLs: false,
          variants: ['https://imagedelivery.net/test-account/test-image-id/public'],
        },
        errors: [],
        messages: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const metadata = await provider.getMetadata('test-image-id');

      expect(metadata).toEqual({
        key: 'test-image-id',
        url: 'https://imagedelivery.net/test-account/test-image-id/public',
        size: 0,
        contentType: 'image/*',
        lastModified: new Date('2024-01-01T00:00:00Z'),
      });
    });
  });

  describe('exists', () => {
    test('should return true if image exists', async () => {
      const mockResponse = {
        success: true,
        result: { id: 'test-image-id' },
        errors: [],
        messages: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const exists = await provider.exists('test-image-id');
      expect(exists).toBeTruthy();
    });

    test('should return false if image does not exist', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Not found'));

      const exists = await provider.exists('non-existent-id');
      expect(exists).toBeFalsy();
    });
  });

  describe('list', () => {
    test('should list images successfully', async () => {
      const mockResponse = {
        success: true,
        result: {
          images: [
            {
              id: 'image-1',
              filename: 'image1.jpg',
              uploaded: '2024-01-01T00:00:00Z',
            },
            {
              id: 'image-2',
              filename: 'image2.jpg',
              uploaded: '2024-01-02T00:00:00Z',
            },
          ],
        },
        errors: [],
        messages: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const images = await provider.list({ limit: 10 });

      expect(images).toHaveLength(2);
      expect(images[0].key).toBe('image-1');
      expect(images[1].key).toBe('image-2');
    });
  });

  describe('createVariant', () => {
    test('should create a variant successfully', async () => {
      const mockResponse = {
        success: true,
        result: {},
        errors: [],
        messages: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const variant = {
        id: 'thumbnail',
        options: {
          fit: 'cover' as const,
          width: 200,
          height: 200,
          quality: 85,
        },
      };

      await provider.createVariant(variant);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/test-account-id/images/v1/variants/thumbnail',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            Authorization: 'Bearer test-api-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(variant),
        }),
      );
    });
  });

  describe('getDirectUploadUrl', () => {
    test('should get direct upload URL successfully', async () => {
      const mockResponse = {
        success: true,
        result: {
          uploadURL: 'https://upload.imagedelivery.net/test-upload-url',
          id: 'test-upload-id',
        },
        errors: [],
        messages: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.getDirectUploadUrl();

      expect(result).toEqual({
        uploadURL: 'https://upload.imagedelivery.net/test-upload-url',
        id: 'test-upload-id',
      });
    });
  });

  describe('download', () => {
    test('should download an image as blob', async () => {
      const mockBlob = new Blob(['image data'], { type: 'image/jpeg' });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      });

      const blob = await provider.download('test-image-id');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://imagedelivery.net/test-account/test-image-id/public',
      );
    });
  });

  describe('getUrl', () => {
    test('should generate URL with variant', async () => {
      const url = await provider.getUrl('test-image-id', { variant: 'thumbnail' });
      expect(url).toBe('https://imagedelivery.net/test-account/test-image-id/thumbnail');
    });

    test('should generate default public URL', async () => {
      const url = await provider.getUrl('test-image-id');
      expect(url).toBe('https://imagedelivery.net/test-account/test-image-id/public');
    });
  });
});
