import { describe, expect, test } from 'vitest';
import { CloudflareR2Provider } from '../providers/cloudflare-r2';

describe('cloudflareR2Provider', () => {
  const mockConfig = {
    accessKeyId: 'test-access-key',
    accountId: 'test-account-id',
    bucket: 'test-bucket',
    secretAccessKey: 'test-secret-key',
  };

  describe('constructor', () => {
    test('should create provider with valid config', async () => {
      const provider = new CloudflareR2Provider(mockConfig);
      expect(provider).toBeDefined();
    });
  });

  describe('basic functionality', () => {
    test('should have required methods', () => {
      const provider = new CloudflareR2Provider(mockConfig);

      expect(provider.upload).toBeDefined();
      expect(provider.download).toBeDefined();
      expect(provider.delete).toBeDefined();
      expect(provider.exists).toBeDefined();
      expect(provider.list).toBeDefined();
      expect(provider.getUrl).toBeDefined();
      expect(provider.getMetadata).toBeDefined();
      expect(provider.getPublicUrl).toBeDefined();
    });

    test('should generate correct public URLs', () => {
      const provider = new CloudflareR2Provider(mockConfig);

      expect(provider.getPublicUrl('test.txt')).toBe('https://pub-test-bucket.r2.dev/test.txt');
      expect(provider.getPublicUrl('folder/test.txt')).toBe(
        'https://pub-test-bucket.r2.dev/folder/test.txt',
      );
      expect(provider.getPublicUrl('test file.txt')).toBe(
        'https://pub-test-bucket.r2.dev/test file.txt',
      );
    });
  });

  // The actual AWS SDK functionality is tested by the centralized mocks
  // and the implementation itself. These tests verify that the provider
  // is correctly constructed and has the expected interface.
});
