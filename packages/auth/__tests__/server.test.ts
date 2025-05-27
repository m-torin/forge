import { beforeEach, describe, expect, it, vi } from 'vitest';

// Now we can import the server module
import { auth, currentUser, getSession } from '../server';

// Mock server-only module before any imports
vi.mock('server-only', () => ({}));

// Mock the keys module to avoid environment variable issues
vi.mock('../keys', () => ({
  keys: vi.fn(() => ({
    BETTER_AUTH_SECRET: 'test-secret',
    DATABASE_URL: 'postgresql://test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  })),
}));

// Mock dependencies
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@repo/database', () => ({
  database: {},
}));

// Mock Better Auth
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    api: {
      getSession: vi.fn(),
    },
  })),
}));

// Mock Better Auth adapters
vi.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: vi.fn(() => ({})),
}));

// Mock Better Auth plugins
vi.mock('better-auth/next-js', () => ({
  nextCookies: vi.fn(() => ({})),
}));

vi.mock('better-auth/plugins', () => ({
  admin: vi.fn(() => ({})),
  apiKey: vi.fn(() => ({})),
  organization: vi.fn(() => ({})),
}));

// Mock analytics
vi.mock('@repo/analytics/posthog/server', () => ({
  analytics: {
    identify: vi.fn(),
    capture: vi.fn(),
  },
}));

describe('Server Authentication Functions', () => {
  let mockGetSession: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Get the mock function from auth object
    mockGetSession = auth.api.getSession;
  });

  describe('currentUser', () => {
    it('returns user when session exists', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockGetSession.mockResolvedValueOnce({
        session: { id: 'session-1' },
        user: mockUser,
      });

      const user = await currentUser();

      expect(user).toEqual(mockUser);
      expect(mockGetSession).toHaveBeenCalled();
    });

    it('returns null when no session exists', async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const user = await currentUser();

      expect(user).toBeNull();
      expect(mockGetSession).toHaveBeenCalled();
    });

    it('returns null when session exists but no user', async () => {
      mockGetSession.mockResolvedValueOnce({
        session: { id: 'session-1' },
        user: null,
      });

      const user = await currentUser();

      expect(user).toBeNull();
    });
  });

  describe('getSession', () => {
    it('returns session when it exists', async () => {
      const mockSession = {
        session: { id: 'session-1' },
        user: {
          id: '1',
          email: 'test@example.com',
        },
      };

      mockGetSession.mockResolvedValueOnce(mockSession);

      const session = await getSession();

      expect(session).toEqual(mockSession);
      expect(mockGetSession).toHaveBeenCalled();
    });

    it('returns null when no session exists', async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const session = await getSession();

      expect(session).toBeNull();
    });
  });

  describe('Better Auth Configuration', () => {
    it('auth object is properly initialized', () => {
      // Verify that auth was initialized correctly
      expect(auth).toBeDefined();
      expect(auth.api).toBeDefined();
      expect(auth.api.getSession).toBeDefined();
      expect(typeof auth.api.getSession).toBe('function');
    });
  });
});
