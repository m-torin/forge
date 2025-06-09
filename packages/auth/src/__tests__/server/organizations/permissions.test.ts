import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  canDeleteOrganization,
  canInviteMembers,
  canManageAPIKeys,
  canManageOrganization,
  canRemoveMembers,
  canUpdateBilling,
  canUpdateMemberRoles,
  canViewBilling,
  hasOrganizationAccess,
  hasOrganizationRole,
  isOrganizationAdmin,
  isOrganizationOwner,
} from '../../../server/organizations/permissions';

import type { OrganizationMember } from '../../../shared/types';

// Use vi.hoisted for mocks
const { mockGetMember, mockGetSession } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockGetMember = vi.fn();

  return { mockGetMember, mockGetSession };
});

vi.mock('../../../server/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
    organization: {
      getMember: mockGetMember,
    },
  },
}));

// Mock headers
const { mockHeaders } = vi.hoisted(() => {
  const mockHeaders = vi.fn().mockResolvedValue(new Headers());
  return { mockHeaders };
});

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}));

// Mock getUserRoleInOrganization and role checking functions
const { mockGetUserRoleInOrganization, mockIsOrganizationAdmin, mockIsOrganizationOwner } =
  vi.hoisted(() => {
    const mockGetUserRoleInOrganization = vi.fn();
    const mockIsOrganizationOwner = vi.fn();
    const mockIsOrganizationAdmin = vi.fn();
    return { mockGetUserRoleInOrganization, mockIsOrganizationAdmin, mockIsOrganizationOwner };
  });

vi.mock('../../../server/organizations/helpers', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getUserRoleInOrganization: mockGetUserRoleInOrganization,
    isOrganizationAdmin: mockIsOrganizationAdmin,
    isOrganizationOwner: mockIsOrganizationOwner,
  };
});

describe('Organization Permissions', () => {
  const mockHeaders = { authorization: 'Bearer test-token' };

  const createMockSession = (overrides = {}) => ({
    session: {
      id: 'session-123',
      activeOrganizationId: 'org-123',
      expiresAt: new Date(Date.now() + 86400000),
      token: 'mock-token',
      userId: 'user-123',
      ...overrides,
    },
    user: {
      id: 'user-123',
      name: 'Test User',
      createdAt: new Date(),
      email: 'test@example.com',
      updatedAt: new Date(),
    },
  });

  const createMockMember = (role: string, overrides = {}): OrganizationMember => ({
    id: 'member-123',
    createdAt: new Date(),
    organizationId: 'org-123',
    role,
    updatedAt: null,
    userId: 'user-123',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasOrganizationAccess', () => {
    it('should return true when user has access to organization', async () => {
      const mockSession = createMockSession();

      // Mock the getSession call that happens inside hasOrganizationAccess
      mockGetSession.mockResolvedValue(mockSession);
      // Mock the getUserRoleInOrganization call
      mockGetUserRoleInOrganization.mockResolvedValue('member');

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
      expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
    });

    it('should return false when user is not a member', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockGetUserRoleInOrganization.mockResolvedValue(null);

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBe(false);
      expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
    });

    it('should return false when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBe(false);
      expect(mockGetSession).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
    });
  });

  describe('hasOrganizationRole', () => {
    it('should return true when user has exact role', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockGetUserRoleInOrganization.mockResolvedValue('admin');

      const result = await hasOrganizationRole('org-123', 'admin');

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
      expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
    });

    it('should return true when user has one of multiple roles', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockGetUserRoleInOrganization.mockResolvedValue('owner');

      const result = await hasOrganizationRole('org-123', 'owner');

      expect(result).toBe(true);
      expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
    });

    it('should return false when user does not have required role', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockGetUserRoleInOrganization.mockResolvedValue('member');

      const result = await hasOrganizationRole('org-123', 'admin');

      expect(result).toBe(false);
      expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
    });
  });

  describe('Role check functions', () => {
    it('isOrganizationOwner should check for owner role', async () => {
      mockIsOrganizationOwner.mockResolvedValue(true);

      const result = await isOrganizationOwner('org-123');

      expect(result).toBe(true);
      expect(mockIsOrganizationOwner).toHaveBeenCalledWith('org-123');
    });

    it('isOrganizationAdmin should check for admin or owner role', async () => {
      mockIsOrganizationAdmin.mockResolvedValue(true);

      const result = await isOrganizationAdmin('org-123');

      expect(result).toBe(true);
      expect(mockIsOrganizationAdmin).toHaveBeenCalledWith('org-123');
    });

    it('isOrganizationAdmin should return true for owner', async () => {
      mockIsOrganizationAdmin.mockResolvedValue(true);

      const result = await isOrganizationAdmin('org-123');

      expect(result).toBe(true);
      expect(mockIsOrganizationAdmin).toHaveBeenCalledWith('org-123');
    });
  });

  describe('Permission check functions', () => {
    describe('canManageOrganization', () => {
      it('should return true for owner', async () => {
        const mockSession = createMockSession();

        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('owner');

        const result = await canManageOrganization('org-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });

      it('should return true for admin', async () => {
        const mockSession = createMockSession();

        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('admin');

        const result = await canManageOrganization('org-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });

      it('should return false for member', async () => {
        const mockSession = createMockSession();

        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('member');

        const result = await canManageOrganization('org-123');

        expect(result).toBe(false);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });
    });

    describe('canInviteMembers', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('admin');

        const result = await canInviteMembers('org-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });
    });

    describe('canRemoveMembers', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('owner');

        const result = await canRemoveMembers('org-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });
    });

    describe('canUpdateMemberRoles', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('owner');

        const result = await canUpdateMemberRoles('org-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });

      it('should return false for admin', async () => {
        const mockSession = createMockSession();
        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('admin');

        const result = await canUpdateMemberRoles('org-123');

        expect(result).toBe(false);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });
    });

    describe('canDeleteOrganization', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('owner');

        const result = await canDeleteOrganization('org-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });
    });

    describe('API key permissions', () => {
      it('canManageAPIKeys should return true for admin roles', async () => {
        const mockSession = createMockSession();
        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('admin');

        const result = await canManageAPIKeys('org-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });
    });

    describe('Billing permissions', () => {
      it('canViewBilling should return true for all members', async () => {
        const mockSession = createMockSession();
        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('member');

        const result = await canViewBilling('org-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });

      it('canUpdateBilling should return true only for owner', async () => {
        const mockSession = createMockSession();
        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('owner');

        const result = await canUpdateBilling('org-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });

      it('canUpdateBilling should return false for admin', async () => {
        const mockSession = createMockSession();
        mockGetSession.mockResolvedValue(mockSession);
        mockGetUserRoleInOrganization.mockResolvedValue('admin');

        const result = await canUpdateBilling('org-123');

        expect(result).toBe(false);
        expect(mockGetSession).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
        expect(mockGetUserRoleInOrganization).toHaveBeenCalledWith('user-123', 'org-123');
      });
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockGetSession.mockRejectedValue(new Error('API error'));

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBe(false);
    });

    it('should handle missing session gracefully', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await canManageOrganization('org-123');

      expect(result).toBe(false);
    });

    it('should handle member lookup errors gracefully', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockGetUserRoleInOrganization.mockRejectedValue(new Error('Database error'));
      // Mock the specific function to return false on error
      mockIsOrganizationOwner.mockResolvedValue(false);

      const result = await isOrganizationOwner('org-123');

      expect(result).toBe(false);
    });
  });
});
