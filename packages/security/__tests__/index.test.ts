import arcjetDefault, { detectBot, request, shield } from '@arcjet/next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Now import after mocks are set up
import { secure } from '../index';
import { keys } from '../keys';

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

vi.mock('../keys', () => ({
  keys: vi.fn(() => ({
    ARCJET_KEY: 'ajkey_test_key',
  })),
}));

describe('secure', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default behavior
    mockProtect.mockResolvedValue({
      isDenied: vi.fn(() => false),
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

    mockRequest.mockResolvedValue(new Request('https://example.com'));
    mockShield.mockReturnValue({ mode: 'LIVE' });
    mockDetectBot.mockReturnValue({ allow: [], mode: 'LIVE' });
  });

  it('should not initialize arcjet if no key is provided', async () => {
    vi.mocked(keys).mockReturnValue({
      ARCJET_KEY: undefined,
    } as any);

    // The key is read at module load time, so we need to re-import
    vi.resetModules();
    vi.doMock('../keys', () => ({
      keys: vi.fn(() => ({
        ARCJET_KEY: undefined,
      })),
    }));

    const { secure: secureNoKey } = await import('../index');
    await secureNoKey([]);

    // Since there's no key, arcjet should not be called
    expect(arcjetDefault).not.toHaveBeenCalled();
  });

  it('should initialize arcjet with correct configuration', async () => {
    await secure(['GOOGLEBOT' as any]);

    expect(mockArcjet).toHaveBeenCalledWith({
      characteristics: ['ip.src'],
      key: 'ajkey_test_key',
      rules: [{ mode: 'LIVE' }],
    });
  });

  it('should detect bots with allowed list', async () => {
    await secure(['GOOGLEBOT' as any, 'CRAWLER' as any]);

    expect(mockDetectBot).toHaveBeenCalledWith({
      allow: ['GOOGLEBOT', 'CRAWLER'],
      mode: 'LIVE',
    });
  });

  it('should use custom request if provided', async () => {
    const customRequest = new Request('https://custom.com');

    await secure(['GOOGLEBOT' as any], customRequest);

    expect(mockRequest).not.toHaveBeenCalled();
    expect(mockProtect).toHaveBeenCalledWith(customRequest);
  });

  it('should use default request if not provided', async () => {
    const defaultRequest = new Request('https://example.com');
    mockRequest.mockResolvedValue(defaultRequest);

    await secure(['GOOGLEBOT' as any]);

    expect(mockRequest).toHaveBeenCalled();
    expect(mockProtect).toHaveBeenCalledWith(defaultRequest);
  });

  it('should throw error if bot is detected', async () => {
    mockProtect.mockResolvedValue({
      isDenied: vi.fn(() => true),
      reason: {
        isBot: vi.fn(() => true),
        isRateLimit: vi.fn(() => false),
      },
    });

    await expect(secure([])).rejects.toThrow('No bots allowed');
  });

  it('should throw error if rate limit is exceeded', async () => {
    mockProtect.mockResolvedValue({
      isDenied: vi.fn(() => true),
      reason: {
        isBot: vi.fn(() => false),
        isRateLimit: vi.fn(() => true),
      },
    });

    await expect(secure([])).rejects.toThrow('Rate limit exceeded');
  });

  it('should throw generic error for other denials', async () => {
    mockProtect.mockResolvedValue({
      isDenied: vi.fn(() => true),
      reason: {
        isBot: vi.fn(() => false),
        isRateLimit: vi.fn(() => false),
      },
    });

    await expect(secure([])).rejects.toThrow('Access denied');
  });

  it('should log warning when request is denied', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockProtect.mockResolvedValue({
      isDenied: vi.fn(() => true),
      reason: {
        isBot: vi.fn(() => false),
        isRateLimit: vi.fn(() => false),
      },
    });

    try {
      await secure([]);
    } catch {
      // Expected to throw
    }

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
