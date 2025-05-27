import { vi } from 'vitest';

// Mock server-only module
vi.mock('server-only', () => ({}));

// Mock environment variables
vi.mock('./keys', () => ({
  keys: () => ({
    SVIX_TOKEN: 'test-svix-token',
  }),
}));

// Mock auth module
vi.mock('@repo/auth/server', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        session: { activeOrganizationId: 'test-org-id' },
      }),
    },
  },
}));
