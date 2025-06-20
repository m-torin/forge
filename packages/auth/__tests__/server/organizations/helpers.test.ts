import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createDefaultOrganization,
  ensureActiveOrganization,
  getOrganizationDetails,
  getUserOrganizations,
} from '../../../server/organizations/helpers';

// Use vi.hoisted to ensure mocks are available during module loading
const {
  mockAuth,
  mockCreateOrganization,
  mockDatabase,
  mockGetFullOrganization,
  mockGetSession,
  mockListOrganizations,
} = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockListOrganizations = vi.fn();
  const mockGetFullOrganization = vi.fn();
  const mockCreateOrganization = vi.fn();

  const mockDatabase = {
    member: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    organization: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  // The getUserOrganizations function accesses auth.organization.listOrganizations for userId param
  // and auth.api.listOrganizations for current user
  const mockAuth = {
    api: {
      createOrganization: mockCreateOrganization,
      getFullOrganization: mockGetFullOrganization,
      getSession: mockGetSession,
      listOrganizations: mockListOrganizations,
    },
    organization: {
      listOrganizations: mockListOrganizations,
    },
  } as any;

  return {
    mockAuth,
    mockCreateOrganization,
    mockDatabase,
    mockGetFullOrganization,
    mockGetSession,
    mockListOrganizations,
  };
});

// Mock the auth module
vi.mock('../../../server/auth', () => ({
  auth: mockAuth,
}));

// Mock the database
vi.mock('@repo/database/prisma', () => ({
  prisma: mockDatabase,
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

describe('Organization Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ensureActiveOrganization', () => {
    it('should return true when session has active organization', async () => {
      const mockSession = {
        session: {
          id: 'session-123',
          activeOrganizationId: 'org-123',
          userId: 'user-123',
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };

      mockGetSession.mockResolvedValue(mockSession);

      const result = await ensureActiveOrganization({ headers: {} });

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledWith({ headers: {} });
    });

    it('should return false when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await ensureActiveOrganization({ headers: {} });

      expect(result).toBe(false);
    });

    it('should return false when active organization is not set', async () => {
      const mockSession = {
        session: {
          id: 'session-123',
          activeOrganizationId: null,
          userId: 'user-123',
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };

      mockGetSession.mockResolvedValue(mockSession);

      const result = await ensureActiveOrganization({ headers: {} });

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockGetSession.mockRejectedValue(new Error('Session error'));

      const result = await ensureActiveOrganization({ headers: {} });

      expect(result).toBe(false);
    });
  });

  describe('getUserOrganizations', () => {
    it('should return user organizations successfully', async () => {
      const mockOrganizations = [
        {
          id: 'org-1',
          name: 'Organization 1',
          createdAt: new Date('2023-01-01'),
          metadata: {},
          slug: 'org-1',
        },
        {
          id: 'org-2',
          name: 'Organization 2',
          createdAt: new Date('2023-01-02'),
          metadata: {},
          slug: 'org-2',
        },
      ];

      mockListOrganizations.mockResolvedValue(mockOrganizations);

      const result = await getUserOrganizations('user-123');

      expect(result).toEqual(mockOrganizations);
      expect(mockListOrganizations).toHaveBeenCalledWith({
        query: {
          limit: 100,
          userId: 'user-123',
        },
      });
    });

    it('should return empty array when user has no organizations', async () => {
      mockListOrganizations.mockResolvedValue([]);

      const result = await getUserOrganizations('user-123');

      expect(result).toEqual([]);
    });

    it('should handle optional parameters', async () => {
      mockListOrganizations.mockResolvedValue([]);

      await getUserOrganizations('user-123', { limit: 50, offset: 10 });

      expect(mockListOrganizations).toHaveBeenCalledWith({
        query: {
          limit: 50,
          offset: 10,
          userId: 'user-123',
        },
      });
    });

    it('should handle errors and return empty array', async () => {
      mockListOrganizations.mockRejectedValue(new Error('API error'));

      const result = await getUserOrganizations('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getOrganizationDetails', () => {
    it('should return full organization details', async () => {
      const mockSession = {
        session: { id: 'session-123' },
        user: { id: 'user-123' },
      };

      const mockOrganization = {
        id: 'org-123',
        name: 'Test Organization',
        createdAt: new Date('2023-01-01'),
        metadata: { plan: 'pro' },
        slug: 'test-org',
      };

      const mockMembers = [
        {
          id: 'member-1',
          createdAt: new Date(),
          organizationId: 'org-123',
          role: 'owner',
          teamId: null,
          updatedAt: null,
          user: { id: 'user-1', name: 'User 1', email: 'user1@example.com' },
          userId: 'user-1',
        },
        {
          id: 'member-2',
          createdAt: new Date(),
          organizationId: 'org-123',
          role: 'member',
          teamId: null,
          updatedAt: null,
          user: { id: 'user-2', name: 'User 2', email: 'user2@example.com' },
          userId: 'user-2',
        },
      ];

      const expectedResult = {
        members: mockMembers,
        organization: mockOrganization,
      };

      // Mock the session
      mockGetSession.mockResolvedValue(mockSession);

      // Mock database calls
      mockDatabase.member.findFirst.mockResolvedValue({
        organizationId: 'org-123',
        userId: 'user-123',
      });
      mockDatabase.organization.findUnique.mockResolvedValue(mockOrganization);
      mockDatabase.member.findMany.mockResolvedValue(mockMembers);

      const result = await getOrganizationDetails('org-123');

      expect(result).toEqual(expectedResult);
      expect(mockGetSession).toHaveBeenCalled();
      expect(mockDatabase.member.findFirst).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-123',
          userId: 'user-123',
        },
      });
      expect(mockDatabase.organization.findUnique).toHaveBeenCalledWith({
        where: { id: 'org-123' },
      });
    });

    it('should return null when organization not found', async () => {
      const mockSession = {
        session: { id: 'session-123' },
        user: { id: 'user-123' },
      };

      mockGetSession.mockResolvedValue(mockSession);
      mockDatabase.member.findFirst.mockResolvedValue({
        organizationId: 'org-123',
        userId: 'user-123',
      });
      mockDatabase.organization.findUnique.mockResolvedValue(null);

      const result = await getOrganizationDetails('org-123');

      expect(result).toBeNull();
    });

    it('should handle errors and return null', async () => {
      mockGetSession.mockRejectedValue(new Error('Session error'));

      const result = await getOrganizationDetails('org-123');

      expect(result).toBeNull();
    });
  });

  describe('createDefaultOrganization', () => {
    it('should create default organization for user', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      const mockCreatedOrg = {
        id: 'org-new',
        name: "John's Organization",
        createdAt: new Date(),
        metadata: {},
        slug: 'johns-organization',
      };

      mockCreateOrganization.mockResolvedValue({ organization: mockCreatedOrg });
      mockDatabase.member.create.mockResolvedValue({});

      const result = await createDefaultOrganization(mockUser.id, mockUser.name);

      expect(result).toEqual(mockCreatedOrg);
      expect(mockCreateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'John Doe',
          slug: 'john-doe',
        },
        headers: expect.any(Headers),
      });
    });

    it('should handle user without name', async () => {
      const mockUser = {
        id: 'user-123',
        name: undefined,
        email: 'user@example.com',
      };

      const mockCreatedOrg = {
        id: 'org-new',
        name: "user-123's Organization",
        createdAt: new Date(),
        metadata: {},
        slug: 'user-123-s-organization',
      };

      mockCreateOrganization.mockResolvedValue({ organization: mockCreatedOrg });
      mockDatabase.member.create.mockResolvedValue({});

      const result = await createDefaultOrganization(mockUser.id, mockUser.name);

      expect(result).toEqual(mockCreatedOrg);
      expect(mockCreateOrganization).toHaveBeenCalledWith({
        body: {
          name: "user-123's Organization",
          slug: 'user-123-s-organization',
        },
        headers: expect.any(Headers),
      });
    });

    it('should generate unique slug from name', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User!@#$%',
        email: 'test@example.com',
      };

      const mockCreatedOrg = {
        id: 'org-new',
        name: 'Test User!@#$%',
        slug: 'test-user-----',
      };

      mockCreateOrganization.mockResolvedValue({ organization: mockCreatedOrg });
      mockDatabase.member.create.mockResolvedValue({});

      const result = await createDefaultOrganization(mockUser.id, mockUser.name);

      expect(mockCreateOrganization).toHaveBeenCalledWith({
        body: {
          name: 'Test User!@#$%',
          slug: 'test-user-----',
        },
        headers: expect.any(Headers),
      });
    });

    it('should handle creation errors', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockCreateOrganization.mockRejectedValue(new Error('Creation failed'));

      // The function catches errors and returns null instead of throwing
      const result = await createDefaultOrganization(mockUser.id, mockUser.name);
      expect(result).toBeNull();
    });
  });
});
