import { vi } from 'vitest';

// Define types locally to avoid circular dependency
interface MockUser {
  createdAt: Date;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  updatedAt: Date;
}

interface MockOrganization {
  createdAt: Date;
  id: string;
  logo: string | null;
  metadata: Record<string, any>;
  name: string;
  slug: string;
  updatedAt: Date;
}

interface MockSession {
  session: {
    id: string;
    userId: string;
    activeOrganizationId: string;
    expiresAt: Date;
    token: string;
  };
  user: MockUser;
}

// Mock user factory
export const createMockUser = (overrides?: Partial<MockUser>): MockUser => ({
  id: 'user_123',
  name: 'Test User',
  createdAt: new Date(),
  email: 'test@example.com',
  emailVerified: true,
  image: null,
  updatedAt: new Date(),
  ...overrides,
});

// Mock organization factory
export const createMockOrganization = (
  overrides?: Partial<MockOrganization>,
): MockOrganization => ({
  id: 'org_123',
  name: 'Test Organization',
  createdAt: new Date(),
  logo: null,
  metadata: {},
  slug: 'test-org',
  updatedAt: new Date(),
  ...overrides,
});

// Mock session factory
export const createMockSession = (overrides?: Partial<MockSession>): MockSession => ({
  session: {
    id: 'session_123',
    activeOrganizationId: 'org_123',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    token: 'mock-token',
    userId: 'user_123',
  },
  user: createMockUser(),
  ...overrides,
});

// Better Auth server mock
export const mockAuthServer = {
  api: {
    getSession: vi.fn().mockResolvedValue(createMockSession()),
    signOut: vi.fn().mockResolvedValue({ success: true }),
  },
  organizationClient: {
    create: vi.fn().mockResolvedValue(createMockOrganization()),
    delete: vi.fn().mockResolvedValue({ success: true }),
    setActive: vi.fn().mockResolvedValue({ success: true }),
    update: vi.fn().mockResolvedValue(createMockOrganization()),
  },
};

// Better Auth client mock
export const mockAuthClient = {
  organization: {
    create: vi.fn().mockResolvedValue(createMockOrganization()),
    setActive: vi.fn().mockResolvedValue({ success: true }),
  },
  signIn: {
    email: vi.fn().mockResolvedValue({ success: true }),
    social: vi.fn(),
  },
  signOut: vi.fn().mockResolvedValue({ success: true }),
  useActiveOrganization: vi.fn().mockReturnValue({
    data: createMockOrganization(),
    error: null,
    isPending: false,
  }),
  useListOrganizations: vi.fn().mockReturnValue({
    data: [createMockOrganization()],
    error: null,
    isPending: false,
  }),
  useSession: vi.fn().mockReturnValue({
    data: createMockSession(),
    error: null,
    isPending: false,
  }),
};

// Middleware mock
export const mockAuthMiddleware = vi.fn().mockImplementation(req => {
  // Add auth headers to request
  req.headers.set('x-user-id', 'user_123');
  req.headers.set('x-organization-id', 'org_123');
  return req;
});
