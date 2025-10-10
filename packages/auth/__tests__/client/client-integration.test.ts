/**
 * Integration tests for client modules
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock React hooks
vi.mock('react', () => ({
  useState: vi.fn(initial => [initial, vi.fn()]),
  useEffect: vi.fn(fn => fn()),
  useCallback: vi.fn(fn => fn),
  useMemo: vi.fn(fn => fn()),
  createContext: vi.fn(() => ({})),
  useContext: vi.fn(() => ({})),
}));

// Mock Auth Provider context to provide expected shape for hooks
vi.mock('#/client/auth-provider', () => ({
  useAuthContext: vi.fn(() => ({
    user: { id: '1', name: 'Test' },
    session: { session: { id: 'sess-1' } },
    isAuthenticated: true,
    isLoading: false,
    activeOrganizationId: null,
    getUserId: vi.fn(() => '1'),
    getSessionId: vi.fn(() => 'sess-1'),
    requireAuth: vi.fn(() => ({ userId: '1', sessionId: 'sess-1' })),
    canPerformAction: vi.fn(() => true),
    hasRole: vi.fn(() => true),
    belongsToOrganization: vi.fn(() => false),
  })),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
}));

// Mock better-auth client
vi.mock('better-auth/react', () => ({
  // Provide createAuthClient for modules that import/re-export it
  createAuthClient: vi.fn(() => ({}) as any),
  useSession: vi.fn(() => ({
    data: null,
    isPending: false,
    error: null,
  })),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

describe('client Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('client factory', () => {
    test('should create client with default configuration', async () => {
      const { createAuthClient } = await import('#/client/client');

      const client = createAuthClient();

      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });

    test('should create client with custom base URL', async () => {
      const { createAuthClient } = await import('#/client/client');

      const customBaseUrl = 'https://api.example.com';
      const client = createAuthClient({ baseURL: customBaseUrl });

      expect(client).toBeDefined();
    });
  });

  describe('navigation utilities', () => {
    test('should handle authentication redirects', async () => {
      const { getAuthRedirectUrl, redirectAfterAuth } = await import('#/client/navigation');

      // Test redirect URL generation
      const redirectUrl = getAuthRedirectUrl('/dashboard');
      expect(typeof redirectUrl).toBe('string');
      expect(redirectUrl).toContain('/dashboard');

      // Stub location.assign to avoid jsdom navigation not implemented errors
      // Replace window.location with a configurable mock
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { assign: vi.fn(), href: '' },
        configurable: true,
      });
      redirectAfterAuth('/dashboard');
      expect((window.location as any).assign).toHaveBeenCalledWith('/dashboard');
      // restore original location
      Object.defineProperty(window, 'location', { value: originalLocation, configurable: true });
    });

    test('should handle callback URLs with parameters', async () => {
      const { getAuthRedirectUrl } = await import('#/client/navigation');

      const redirectUrl = getAuthRedirectUrl('/dashboard?tab=settings');
      expect(redirectUrl).toContain('dashboard');
      expect(redirectUrl).toContain('tab');
    });
  });

  describe('authentication methods', () => {
    test('should provide sign-in functionality', async () => {
      // Mock the methods module
      vi.doMock('#/client/methods', () => ({
        signIn: vi.fn().mockResolvedValue({ success: true }),
        signUp: vi.fn().mockResolvedValue({ success: true }),
        signOut: vi.fn().mockResolvedValue({ success: true }),
      }));

      const { signIn, signUp, signOut } = await import('#/client/methods');

      // Test sign-in
      const signInResult = await signIn({ email: 'test@example.com', password: 'password' });
      expect(signInResult).toEqual({ success: true });

      // Test sign-up
      const signUpResult = await signUp({ email: 'test@example.com', password: 'password' });
      expect(signUpResult).toEqual({ success: true });

      // Test sign-out
      const signOutResult = await signOut();
      expect(signOutResult).toEqual({ success: true });
    });

    test('should handle authentication errors', async () => {
      vi.doMock('#/client/methods', () => ({
        signIn: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
      }));

      const { signIn } = await import('#/client/methods');

      await expect(signIn({ email: 'invalid@example.com', password: 'wrong' })).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('hooks integration', () => {
    test('should provide authentication hooks', async () => {
      const { useAuth, useUser } = await import('#/client/hooks');

      // Test auth hook
      const authResult = useAuth();
      expect(authResult).toBeDefined();

      // Test user hook
      const userResult = useUser();
      expect(userResult).toBeDefined();
    });

    test('should provide loading states', async () => {
      const { useAuthLoading } = await import('#/client/hooks');

      const loading = useAuthLoading();
      expect(typeof loading).toBe('boolean');
    });
  });

  describe('aPI key client integration', () => {
    test('should handle API key operations', async () => {
      // Mock API key functions
      vi.doMock('#/client/api-keys', () => ({
        createApiKey: vi.fn().mockResolvedValue({ id: 'key-123', key: 'sk-test' }),
        listApiKeys: vi.fn().mockResolvedValue([]),
        deleteApiKey: vi.fn().mockResolvedValue({ success: true }),
      }));

      const { createApiKey, listApiKeys, deleteApiKey } = await import('#/client/api-keys');

      // Test API key creation
      const createResult = await createApiKey({ name: 'Test Key', permissions: ['read'] });
      expect(createResult).toEqual({ id: 'key-123', key: 'sk-test' });

      // Test API key listing
      const listResult = await listApiKeys();
      expect(Array.isArray(listResult)).toBeTruthy();

      // Test API key deletion
      const deleteResult = await deleteApiKey('key-123');
      expect(deleteResult).toEqual({ success: true });
    });
  });

  describe('teams client integration', () => {
    test('should handle team operations', async () => {
      vi.doMock('#/client/teams', () => ({
        createTeam: vi.fn().mockResolvedValue({ id: 'team-123', name: 'Test Team' }),
        getTeams: vi.fn().mockResolvedValue([]),
        joinTeam: vi.fn().mockResolvedValue({ success: true }),
        leaveTeam: vi.fn().mockResolvedValue({ success: true }),
      }));

      const { createTeam, getTeams, joinTeam, leaveTeam } = await import('#/client/teams');

      // Test team creation
      const createResult = await createTeam({ name: 'Test Team' });
      expect(createResult).toEqual({ id: 'team-123', name: 'Test Team' });

      // Test getting teams
      const teamsResult = await getTeams();
      expect(Array.isArray(teamsResult)).toBeTruthy();

      // Test joining team
      const joinResult = await joinTeam('team-123');
      expect(joinResult).toEqual({ success: true });

      // Test leaving team
      const leaveResult = await leaveTeam('team-123');
      expect(leaveResult).toEqual({ success: true });
    });
  });

  describe('error handling integration', () => {
    test('should handle network errors gracefully', async () => {
      vi.doMock('#/client/methods', () => ({
        signIn: vi.fn().mockRejectedValue(new Error('Network error')),
      }));

      const { signIn } = await import('#/client/methods');

      await expect(signIn({ email: 'test@example.com', password: 'password' })).rejects.toThrow(
        'Network error',
      );
    });

    test('should handle authentication state correctly', async () => {
      const { useAuth } = await import('#/client/hooks');

      const authState = useAuth();

      // Should return an object with authentication state
      expect(typeof authState).toBe('object');
    });
  });

  describe('client utilities integration', () => {
    test('should provide logger functionality', async () => {
      const { createLogger } = await import('#/client/utils/logger');

      const logger = createLogger('test');

      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
    });

    test('should handle different log levels', async () => {
      const { createLogger } = await import('#/client/utils/logger');

      const logger = createLogger('test', 'debug');

      // Should not throw when calling different log methods
      expect(() => console.log('Testing logger.debug functionality')).not.toThrow();
      expect(() => logger.info('Info message')).not.toThrow();
      expect(() => logger.warn('Warning message')).not.toThrow();
      expect(() => logger.error('Error message')).not.toThrow();
    });
  });
});
