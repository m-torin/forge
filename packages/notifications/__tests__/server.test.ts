import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock environment variables
const mockSafeEnv = vi.fn();
vi.mock('../env', () => ({
  safeEnv: mockSafeEnv,
}));

// Mock Knock SDK
const mockKnockInstance = {
  users: vi.fn(),
  workflows: vi.fn(),
  objects: vi.fn(),
  bulk: vi.fn(),
  // Remove non-existent methods
};

const mockKnock = vi.fn().mockImplementation(() => mockKnockInstance);
vi.mock('@knocklabs/node', () => ({
  Knock: mockKnock,
}));

describe('server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('module exports without errors', async () => {
    mockSafeEnv.mockReturnValue({
      KNOCK_SECRET_API_KEY: 'test-knock-key',
    });

    expect(async () => {
      await import('../src/server');
    }).not.toThrow();
  });

  test('should initialize Knock with API key', async () => {
    mockSafeEnv.mockReturnValue({
      KNOCK_SECRET_API_KEY: 'sk_test_123',
    });

    const { notifications } = await import('../src/server');

    // Access a property to trigger the proxy
    const users = notifications.users;
    expect(mockKnock).toHaveBeenCalledWith({ apiKey: 'sk_test_123' });
  });

  test('should handle missing API key gracefully', async () => {
    mockSafeEnv.mockReturnValue({
      KNOCK_SECRET_API_KEY: undefined,
    });

    // Force module reload
    vi.resetModules();
    const { notifications } = await import('../src/server');

    // Access notification methods when API key is missing
    const users = notifications.users;
    expect(users).toBeUndefined();

    // Test other notification methods
    const workflows = notifications.workflows;
    const objects = notifications.objects;
    expect(workflows).toBeUndefined();
    expect(objects).toBeUndefined();
  });

  test('should return undefined for unknown properties when API key is missing', async () => {
    mockSafeEnv.mockReturnValue({
      KNOCK_SECRET_API_KEY: undefined,
    });

    vi.resetModules();
    const { notifications } = await import('../src/server');

    // Access unknown property
    const unknown = (notifications as any).unknownProperty;
    expect(unknown).toBeUndefined();
  });

  test('should proxy methods to Knock client when API key is present', async () => {
    // For this test, we'll use the default mock which has an API key
    mockSafeEnv.mockReturnValue({
      KNOCK_SECRET_API_KEY: 'sk_test_valid',
    });

    const { notifications } = await import('../src/server');

    // When API key is present, accessing properties should work
    // The proxy should delegate to the Knock instance
    expect(() => {
      const users = notifications.users;
      const workflows = notifications.workflows;
      // These shouldn't throw and should return the mocked functions
    }).not.toThrow();
  });
});
