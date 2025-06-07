import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createDefaultOrganization,
  ensureActiveOrganization,
  getOrganizationDetails,
  getUserOrganizations,
} from '../../../server/organizations/helpers';

import type { BetterAuthClient } from 'better-auth/types';

// Mock auth instance
const mockGetSession = vi.fn();
const mockListOrganizations = vi.fn();
const mockGetFullOrganization = vi.fn();
const mockCreateOrganization = vi.fn();

const mockAuth = {
  api: {
    getSession: mockGetSession,
  },
  organization: {
    createOrganization: mockCreateOrganization,
    getFullOrganization: mockGetFullOrganization,
    listOrganizations: mockListOrganizations,
  },
} as unknown as BetterAuthClient;

// Mock the auth module
vi.mock('../../auth', () => ({
  auth: mockAuth,
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
      const mockOrgDetails = {
        id: 'org-123',
        name: 'Test Organization',
        createdAt: new Date('2023-01-01'),
        invitations: [
          {
            id: 'invite-1',
            email: 'invited@example.com',
            expiresAt: new Date('2024-01-01'),
            organizationId: 'org-123',
            role: 'member',
            status: 'pending',
          },
        ],
        members: [
          {
            id: 'member-1',
            createdAt: new Date(),
            organizationId: 'org-123',
            role: 'owner',
            userId: 'user-1',
          },
          {
            id: 'member-2',
            createdAt: new Date(),
            organizationId: 'org-123',
            role: 'member',
            userId: 'user-2',
          },
        ],
        metadata: { plan: 'pro' },
        slug: 'test-org',
      };

      mockGetFullOrganization.mockResolvedValue(mockOrgDetails);

      const result = await getOrganizationDetails('org-123');

      expect(result).toEqual(mockOrgDetails);
      expect(mockGetFullOrganization).toHaveBeenCalledWith({
        query: { id: 'org-123' },
      });
    });

    it('should return null when organization not found', async () => {
      mockGetFullOrganization.mockResolvedValue(null);

      const result = await getOrganizationDetails('org-123');

      expect(result).toBeNull();
    });

    it('should handle errors and return null', async () => {
      mockGetFullOrganization.mockRejectedValue(new Error('Not found'));

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

      mockCreateOrganization.mockResolvedValue(mockCreatedOrg);

      const result = await createDefaultOrganization(mockUser);

      expect(result).toEqual(mockCreatedOrg);
      expect(mockCreateOrganization).toHaveBeenCalledWith({
        name: "John's Organization",
        slug: 'johns-organization',
      });
    });

    it('should handle user without name', async () => {
      const mockUser = {
        id: 'user-123',
        name: null,
        email: 'user@example.com',
      };

      const mockCreatedOrg = {
        id: 'org-new',
        name: 'My Organization',
        createdAt: new Date(),
        metadata: {},
        slug: 'my-organization',
      };

      mockCreateOrganization.mockResolvedValue(mockCreatedOrg);

      const result = await createDefaultOrganization(mockUser);

      expect(result).toEqual(mockCreatedOrg);
      expect(mockCreateOrganization).toHaveBeenCalledWith({
        name: 'My Organization',
        slug: 'my-organization',
      });
    });

    it('should generate unique slug from name', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User!@#$%',
        email: 'test@example.com',
      };

      mockCreateOrganization.mockResolvedValue({
        id: 'org-new',
        name: "Test's Organization",
        slug: 'tests-organization',
      });

      await createDefaultOrganization(mockUser);

      expect(mockCreateOrganization).toHaveBeenCalledWith({
        name: "Test's Organization",
        slug: 'tests-organization',
      });
    });

    it('should handle creation errors', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockCreateOrganization.mockRejectedValue(new Error('Creation failed'));

      await expect(createDefaultOrganization(mockUser)).rejects.toThrow('Creation failed');
    });
  });
});
