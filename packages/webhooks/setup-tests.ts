import '@repo/testing/src/vitest/core/setup';
import { vi } from 'vitest';

// Mock environment variables
process.env.SVIX_TOKEN = 'sk_test_svix_token';
process.env.NODE_ENV = 'test';

// Mock @t3-oss/env-nextjs
vi.mock('@t3-oss/env-nextjs', () => ({
  createEnv: vi.fn().mockImplementation(({ server, runtimeEnv }) => {
    const env = {};
    Object.keys(server).forEach((key) => {
      env[key] = runtimeEnv[key];
    });
    return () => env;
  }),
}));

// Mock server-only
vi.mock('server-only', () => {
  return {};
});

// Mock @repo/auth/server
vi.mock('@repo/auth/server', () => ({
  auth: vi.fn().mockResolvedValue({
    orgId: 'test-org-id',
    userId: 'test-user-id',
  }),
}));

// Mock svix
vi.mock('svix', () => {
  const mockMessage = {
    create: vi.fn().mockResolvedValue({
      id: 'msg_test123',
      eventType: 'test.event',
      payload: {},
    }),
  };

  const mockAuthentication = {
    appPortalAccess: vi.fn().mockResolvedValue({
      url: 'https://app.svix.com/portal/test',
      token: 'test-token',
    }),
  };

  return {
    Svix: vi.fn().mockImplementation(() => ({
      message: mockMessage,
      authentication: mockAuthentication,
    })),
  };
});
