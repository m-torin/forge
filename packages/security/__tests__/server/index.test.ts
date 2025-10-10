/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, vi } from 'vitest';

import arcjetDefault, { detectBot, request, shield } from '@arcjet/next';
import { safeEnv } from '../../env';
// Now import after mocks are set up
import { secure } from '../../src/server-next';

// Mock server-only to prevent errors - must be first
vi.mock('server-only', () => ({}));

// Mock the database Redis module
vi.mock('@repo/db-upstash-redis/server', () => {
  // Create a simple in-memory mock Redis inside the factory
  const storage = new Map<string, any>();

  return {
    redis: {
      async get(key: string) {
        return storage.get(key) || null;
      },

      async set(key: string, value: any) {
        storage.set(key, value);
        return 'OK';
      },

      async del(key: string) {
        return storage.delete(key) ? 1 : 0;
      },

      clear() {
        storage.clear();
      },
    },
  };
});

// Don't mock the secure function - we want to test it

// Define mocks before imports
const mockProtect = vi.fn();
const mockWithRule = vi.fn();
const mockArcjet = vi.fn();
const mockRequest = vi.fn();
const mockShield = vi.fn();
const mockDetectBot = vi.fn();

// Mock dependencies
vi.mock('@arcjet/next', () => ({
  default: vi.fn(),
  detectBot: vi.fn(),
  request: vi.fn(),
  shield: vi.fn(),
}));

vi.mock('../../env', () => ({
  safeEnv: vi.fn(() => ({
    ARCJET_KEY: 'ajkey_test_key',
  })),
}));

describe('secure', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default behavior
    mockProtect.mockResolvedValue({
      isDenied: () => false,
      reason: {
        isBot: () => false,
        isRateLimit: () => false,
      },
    });
    mockWithRule.mockReturnValue({
      protect: mockProtect,
    });
    mockArcjet.mockReturnValue({
      withRule: mockWithRule,
    });

    // Mock the imported functions
    vi.mocked(arcjetDefault).mockImplementation(mockArcjet);
    vi.mocked(request).mockImplementation(mockRequest);
    vi.mocked(shield).mockImplementation(mockShield);
    vi.mocked(detectBot).mockImplementation(mockDetectBot);

    mockRequest.mockResolvedValue({ url: 'https://example.com' } as any);
    mockShield.mockReturnValue({ mode: 'LIVE' });
    mockDetectBot.mockReturnValue({ allow: [], mode: 'LIVE' });
  });

  test('should not initialize arcjet if no key is provided', async () => {
    (vi.mocked(safeEnv) as any).mockReturnValue({
      ARCJET_KEY: undefined,
    });

    // The key is read at module load time, so we need to re-import
    vi.resetModules();
    vi.doMock('../../env', () => ({
      safeEnv: vi.fn(() => ({
        ARCJET_KEY: undefined,
      })),
    }));

    const { secure: secureNoKey } = await import('../../src/server-next');
    await secureNoKey([]);

    // Since there's no key, arcjet should not be called
    expect(arcjetDefault).not.toHaveBeenCalled();
  });

  test('should initialize arcjet with correct configuration', async () => {
    await secure(['GOOGLEBOT' as any]);

    expect(mockArcjet).toHaveBeenCalledWith({
      characteristics: ['ip.src'],
      key: 'ajkey_test_key',
      rules: [{ mode: 'LIVE' }],
    });
  });

  test('should detect bots with allowed list', async () => {
    await secure(['GOOGLEBOT' as any, 'CRAWLER' as any]);

    expect(mockDetectBot).toHaveBeenCalledWith({
      allow: ['GOOGLEBOT', 'CRAWLER'],
      mode: 'LIVE',
    });
  });

  test('should use custom request if provided', async () => {
    const customRequest = { url: 'https://custom.com' } as any;

    await secure(['GOOGLEBOT' as any], customRequest);

    expect(mockRequest).not.toHaveBeenCalled();
    expect(mockProtect).toHaveBeenCalledWith(customRequest);
  });

  test('should use default request if not provided', async () => {
    const defaultRequest = { url: 'https://example.com' } as any;
    mockRequest.mockResolvedValue(defaultRequest);

    await secure(['GOOGLEBOT' as any]);

    expect(mockRequest).toHaveBeenCalledWith();
    expect(mockProtect).toHaveBeenCalledWith(defaultRequest);
  });

  test('should throw error if bot is detected', async () => {
    mockProtect.mockResolvedValue({
      isDenied: () => true,
      reason: {
        isBot: () => true,
        isRateLimit: () => false,
      },
    });

    await expect(secure([])).rejects.toThrow('No bots allowed');
  });

  test('should throw error if rate limit is exceeded', async () => {
    mockProtect.mockResolvedValue({
      isDenied: () => true,
      reason: {
        isBot: () => false,
        isRateLimit: () => true,
      },
    });

    await expect(secure([])).rejects.toThrow('Rate limit exceeded');
  });

  test('should throw generic error for other denials', async () => {
    mockProtect.mockResolvedValue({
      isDenied: () => true,
      reason: {
        isBot: () => false,
        isRateLimit: () => false,
      },
    });

    await expect(secure([])).rejects.toThrow('Access denied');
  });

  test('should not log warning when request is denied', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockProtect.mockResolvedValue({
      isDenied: () => true,
      reason: {
        isBot: () => false,
        isRateLimit: () => false,
      },
    });

    try {
      await secure([]);
    } catch {
      // Expected to throw
    }

    // Console.warn should not be called since it's commented out in the actual implementation
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
