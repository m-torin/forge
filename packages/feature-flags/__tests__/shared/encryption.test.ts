import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock observability functions
const mockLogError = vi.fn();
const mockLogInfo = vi.fn();
const mockLogWarn = vi.fn();

vi.mock('@repo/observability', () => ({
  logError: mockLogError,
  logInfo: mockLogInfo,
  logWarn: mockLogWarn,
}));

// Mock environment
const mockSafeEnv = vi.fn();

vi.mock('#/env', () => ({
  safeEnv: mockSafeEnv,
}));

// Mock flags package
const mockEncryptFlagValues = vi.fn();
vi.mock('flags', async () => ({
  encryptFlagValues: mockEncryptFlagValues,
}));

// Mock Web Crypto API
const mockSubtle = {
  importKey: vi.fn(),
  encrypt: vi.fn(),
  decrypt: vi.fn(),
};

const mockCrypto = {
  subtle: mockSubtle,
  getRandomValues: vi.fn(),
};

Object.defineProperty(globalThis, 'crypto', {
  value: mockCrypto,
  writable: true,
});

// Mock Buffer for Node.js fallback
Object.defineProperty(globalThis, 'Buffer', {
  value: {
    from: vi.fn().mockReturnValue({
      toString: vi.fn().mockReturnValue('base64-encoded-data'),
    }),
  },
  writable: true,
});

// Mock btoa
Object.defineProperty(globalThis, 'btoa', {
  value: vi.fn().mockReturnValue('base64-encrypted-data'),
  writable: true,
});

describe('shared/encryption', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset module cache to ensure fresh imports
    vi.resetModules();

    // Default environment setup
    mockSafeEnv.mockReturnValue({
      FLAGS_SECRET: 'test-secret-key-32-characters-long',
    });
  });

  describe('encryptFlags', () => {
    test('should throw error when FLAGS_SECRET is not configured', async () => {
      mockSafeEnv.mockReturnValue({ FLAGS_SECRET: undefined });

      const { encryptFlags } = await import('#/shared/encryption');

      await expect(encryptFlags({ flag: true })).rejects.toThrow(
        'FLAGS_SECRET is required for flag encryption',
      );

      expect(mockLogWarn).toHaveBeenCalledWith(
        'FLAGS_SECRET not configured - flag values will not be encrypted',
        { context: 'encryption' },
      );
    });

    test('should use flags package encryptFlagValues when available', async () => {
      mockEncryptFlagValues.mockResolvedValue('encrypted-by-flags-package');

      const { encryptFlags } = await import('#/shared/encryption');

      const values = { testFlag: true, anotherFlag: 'value' };
      const result = await encryptFlags(values);

      expect(result).toBe('encrypted-by-flags-package');
      expect(mockEncryptFlagValues).toHaveBeenCalledWith(
        values,
        'test-secret-key-32-characters-long',
      );
    });

    test('should use Web Crypto API when flags package is not available', async () => {
      // Mock flags package import failure
      vi.doMock('flags', () => {
        throw new Error('flags package not available');
      });

      const mockKey = { type: 'secret' };
      const mockEncrypted = new ArrayBuffer(16);
      const mockIv = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

      mockSubtle.importKey.mockResolvedValue(mockKey);
      mockSubtle.encrypt.mockResolvedValue(mockEncrypted);
      mockCrypto.getRandomValues.mockReturnValue(mockIv);

      const { encryptFlags } = await import('#/shared/encryption');

      const values = { flag: true };
      const result = await encryptFlags(values);

      expect(result).toBe('base64-encrypted-data');
      expect(mockSubtle.importKey).toHaveBeenCalledWith(
        'raw',
        expect.any(Uint8Array),
        { name: 'AES-GCM' },
        false,
        ['encrypt'],
      );
      expect(mockSubtle.encrypt).toHaveBeenCalledWith(
        { name: 'AES-GCM', iv: mockIv },
        mockKey,
        expect.any(Uint8Array),
      );
    });

    test('should use base64 fallback when crypto is not available', async () => {
      // Mock flags package import failure
      vi.doMock('flags', () => {
        throw new Error('flags package not available');
      });

      // Remove crypto from global
      Object.defineProperty(globalThis, 'crypto', {
        value: undefined,
        writable: true,
      });

      const { encryptFlags } = await import('#/shared/encryption');

      const values = { flag: true };
      const result = await encryptFlags(values);

      expect(result).toBe('base64-encoded-data');
      expect(mockLogWarn).toHaveBeenCalledWith(
        'Real encryption not available, using base64 fallback (development only)',
        { context: 'encryption-fallback' },
      );

      // Restore crypto
      Object.defineProperty(globalThis, 'crypto', {
        value: mockCrypto,
        writable: true,
      });
    });

    test('should handle Web Crypto API errors gracefully', async () => {
      // Mock flags package import failure
      vi.doMock('flags', () => {
        throw new Error('flags package not available');
      });

      const cryptoError = new Error('Crypto operation failed');
      mockSubtle.importKey.mockRejectedValue(cryptoError);

      const { encryptFlags } = await import('#/shared/encryption');

      await expect(encryptFlags({ flag: true })).rejects.toThrow('Crypto operation failed');
      expect(mockLogError).toHaveBeenCalledWith(cryptoError, {
        context: 'encryption',
      });
    });

    test('should handle flags package encryption errors', async () => {
      const flagsError = new Error('Flags encryption failed');
      mockEncryptFlagValues.mockRejectedValue(flagsError);

      const { encryptFlags } = await import('#/shared/encryption');

      await expect(encryptFlags({ flag: true })).rejects.toThrow('Flags encryption failed');
      expect(mockLogError).toHaveBeenCalledWith(flagsError, {
        context: 'encryption',
      });
    });

    test('should handle non-Error exceptions', async () => {
      mockEncryptFlagValues.mockRejectedValue('string error');

      const { encryptFlags } = await import('#/shared/encryption');

      await expect(encryptFlags({ flag: true })).rejects.toThrow('string error');
      expect(mockLogError).toHaveBeenCalledWith(expect.any(Error), { context: 'encryption' });
    });

    test('should properly encode secret key for Web Crypto API', async () => {
      // Mock flags package import failure
      vi.doMock('flags', () => {
        throw new Error('flags package not available');
      });

      const mockKey = { type: 'secret' };
      mockSubtle.importKey.mockResolvedValue(mockKey);
      mockSubtle.encrypt.mockResolvedValue(new ArrayBuffer(16));
      mockCrypto.getRandomValues.mockReturnValue(new Uint8Array(12));

      const { encryptFlags } = await import('#/shared/encryption');

      await encryptFlags({ flag: true });

      // Verify the key material is properly sliced to 32 bytes
      const importKeyCall = mockSubtle.importKey.mock.calls[0];
      const keyMaterial = importKeyCall[1] as Uint8Array;
      expect(keyMaterial.length).toBeLessThanOrEqual(32);
    });
  });

  describe('decryptFlags', () => {
    test('should log deprecation warning', async () => {
      const { decryptFlags } = await import('#/shared/encryption');

      await decryptFlags('encrypted-data');

      expect(mockLogWarn).toHaveBeenCalledWith(
        'decryptFlags is deprecated - modern flags SDK handles decryption internally',
        { context: 'encryption-deprecation' },
      );
    });

    test('should return empty object by default', async () => {
      const { decryptFlags } = await import('#/shared/encryption');

      const result = await decryptFlags('encrypted-data');

      expect(result).toStrictEqual({});
    });
  });

  describe('isEncryptionAvailable', () => {
    test('should return true when FLAGS_SECRET is configured and in production', async () => {
      mockSafeEnv.mockReturnValue({
        FLAGS_SECRET: 'test-secret',
        NODE_ENV: 'production',
      });

      const { isEncryptionAvailable } = await import('#/shared/encryption');

      const result = isEncryptionAvailable();

      expect(result).toBeTruthy();
    });

    test('should return false when FLAGS_SECRET is not configured', async () => {
      mockSafeEnv.mockReturnValue({
        FLAGS_SECRET: undefined,
        NODE_ENV: 'production',
      });

      const { isEncryptionAvailable } = await import('#/shared/encryption');

      const result = isEncryptionAvailable();

      expect(result).toBeFalsy();
    });

    test('should return false in development environment', async () => {
      mockSafeEnv.mockReturnValue({
        FLAGS_SECRET: 'test-secret',
        NODE_ENV: 'development',
      });

      const { isEncryptionAvailable } = await import('#/shared/encryption');

      const result = isEncryptionAvailable();

      expect(result).toBeFalsy();
    });
  });

  describe('getEncryptionStatus', () => {
    test('should return status when encryption is available', async () => {
      mockSafeEnv.mockReturnValue({
        FLAGS_SECRET: 'test-secret',
        NODE_ENV: 'production',
      });

      const { getEncryptionStatus } = await import('#/shared/encryption');

      const result = getEncryptionStatus();

      expect(result).toMatchObject({
        available: true,
        method: expect.any(String),
        environment: 'production',
      });
    });

    test('should return status when encryption is not available', async () => {
      mockSafeEnv.mockReturnValue({
        FLAGS_SECRET: undefined,
        NODE_ENV: 'development',
      });

      const { getEncryptionStatus } = await import('#/shared/encryption');

      const result = getEncryptionStatus();

      expect(result).toMatchObject({
        available: false,
        method: 'none',
        environment: 'development',
      });
    });
  });

  test('should handle lazy loading correctly on subsequent calls', async () => {
    mockEncryptFlagValues.mockResolvedValue('encrypted-result');

    const { encryptFlags } = await import('#/shared/encryption');

    // First call
    await encryptFlags({ flag1: true });

    // Second call should reuse the cached function
    await encryptFlags({ flag2: false });

    expect(mockEncryptFlagValues).toHaveBeenCalledTimes(2);
  });
});
