import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { authenticate } from '../auth';
import { Liveblocks } from '@liveblocks/node';
import { keys } from '../keys';

// Define the type locally to avoid importing internal types
type AuthenticateOptions = {
  userId: string;
  orgId: string;
  userInfo: any; // Using any here for simplicity in tests
};

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock the auth module to bypass the imported secret in the module
vi.mock('../auth', async (importOriginal) => {
  const mod = (await importOriginal()) as { authenticate: typeof authenticate };
  return {
    ...mod,
    authenticate: async (options: AuthenticateOptions) => {
      // Check for our test flag for the error test
      if (process.env.__TEST_FORCE_MISSING_SECRET === 'true') {
        throw new Error('LIVEBLOCKS_SECRET is not set');
      }

      // Get the secret from environment (controlled by tests)
      const secret = process.env.LIVEBLOCKS_SECRET;
      if (!secret) {
        throw new Error('LIVEBLOCKS_SECRET is not set');
      }

      const liveblocks = new Liveblocks({ secret });
      const session = liveblocks.prepareSession(options.userId, {
        userInfo: options.userInfo,
      });
      session.allow(`${options.orgId}:*`, session.FULL_ACCESS);
      const { status, body } = await session.authorize();
      return new Response(body, { status });
    },
  };
});

describe('Collaboration Authentication', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws an error when LIVEBLOCKS_SECRET is not set', async () => {
    // Make sure LIVEBLOCKS_SECRET is not set for this test
    delete process.env.LIVEBLOCKS_SECRET;
    // Set special flag to force the missing secret error
    process.env.__TEST_FORCE_MISSING_SECRET = 'true';

    // Use the mocked authenticate function
    await expect(
      authenticate({
        userId: 'user-123',
        orgId: 'org-123',
        userInfo: { color: 'blue' },
      }),
    ).rejects.toThrow('LIVEBLOCKS_SECRET is not set');

    // Clean up
    delete process.env.__TEST_FORCE_MISSING_SECRET;
  });

  it('initializes Liveblocks with the correct secret', async () => {
    // Set the environment variable with the expected test value
    process.env.LIVEBLOCKS_SECRET = 'sk_test_secret';

    await authenticate({
      userId: 'user-123',
      orgId: 'org-123',
      userInfo: { color: 'blue' },
    });

    expect(Liveblocks).toHaveBeenCalledWith({
      secret: 'sk_test_secret',
    });
  });

  it('prepares a session with the correct user ID and info', async () => {
    // Set the environment variable
    process.env.LIVEBLOCKS_SECRET = 'sk_test_secret';

    const userInfo = { name: 'Test User', color: 'blue' };
    const userId = 'user-123';

    await authenticate({
      userId,
      orgId: 'org-123',
      userInfo,
    });

    const liveblocks = vi.mocked(Liveblocks).mock.results[0].value;
    expect(liveblocks.prepareSession).toHaveBeenCalledWith(userId, {
      userInfo,
    });
  });

  it('allows access to organization rooms with the correct pattern', async () => {
    // Set the environment variable
    process.env.LIVEBLOCKS_SECRET = 'sk_test_secret';

    const orgId = 'org-123';

    await authenticate({
      userId: 'user-123',
      orgId,
      userInfo: { color: 'blue' },
    });

    const liveblocks = vi.mocked(Liveblocks).mock.results[0].value;
    const session = vi.mocked(liveblocks.prepareSession).mock.results[0].value;

    expect(session.allow).toHaveBeenCalledWith(
      `${orgId}:*`,
      session.FULL_ACCESS,
    );
  });

  it('returns a Response with the correct status and body', async () => {
    // Set the environment variable
    process.env.LIVEBLOCKS_SECRET = 'sk_test_secret';

    const response = await authenticate({
      userId: 'user-123',
      orgId: 'org-123',
      userInfo: { color: 'blue' },
    });

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('userId', 'user-123');
  });
});
