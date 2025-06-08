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

// Mock the auth module
const mockGetSession = vi.fn();
const mockGetMember = vi.fn();

vi.mock('../../auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
    organization: {
      getMember: mockGetMember,
    },
  },
}));

describe('Organization Permissions', () => {
  const mockHeaders = { authorization: 'Bearer test-token' };

  const createMockSession = (overrides = {}) => ({
    session: {
      id: 'session-123',
      activeOrganizationId: 'org-123',
      userId: 'user-123',
      ...overrides,
    },
    user: {
      id: 'user-123',
      email: 'test@example.com',
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
      const mockMember = createMockMember('member');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetMember.mockResolvedValue(mockMember);

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBe(true);
      expect(mockGetMember).toHaveBeenCalledWith({
        query: {
          organizationId: 'org-123',
          userId: 'user-123',
        },
      });
    });

    it('should return false when user is not a member', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockGetMember.mockResolvedValue(null);

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBe(false);
    });

    it('should return false when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBe(false);
    });
  });

  describe('hasOrganizationRole', () => {
    it('should return true when user has exact role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockMember('admin');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetMember.mockResolvedValue(mockMember);

      const result = await hasOrganizationRole('org-123', 'admin');

      expect(result).toBe(true);
    });

    it('should return true when user has one of multiple roles', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockMember('owner');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetMember.mockResolvedValue(mockMember);

      const result = await hasOrganizationRole('org-123', 'owner');

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockMember('member');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetMember.mockResolvedValue(mockMember);

      const result = await hasOrganizationRole('org-123', 'admin');

      expect(result).toBe(false);
    });
  });

  describe('Role check functions', () => {
    it('isOrganizationOwner should check for owner role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockMember('owner');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetMember.mockResolvedValue(mockMember);

      const result = await isOrganizationOwner('org-123');

      expect(result).toBe(true);
    });

    it('isOrganizationAdmin should check for admin or owner role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockMember('admin');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetMember.mockResolvedValue(mockMember);

      const result = await isOrganizationAdmin('org-123');

      expect(result).toBe(true);
    });

    it('isOrganizationAdmin should return true for owner', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockMember('owner');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetMember.mockResolvedValue(mockMember);

      const result = await isOrganizationAdmin('org-123');

      expect(result).toBe(true);
    });
  });

  describe('Permission check functions', () => {
    describe('canManageOrganization', () => {
      it('should return true for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canManageOrganization('org-123');

        expect(result).toBe(true);
      });

      it('should return true for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canManageOrganization('org-123');

        expect(result).toBe(true);
      });

      it('should return false for member', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('member');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canManageOrganization('org-123');

        expect(result).toBe(false);
      });
    });

    describe('canInviteMembers', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canInviteMembers('org-123');

        expect(result).toBe(true);
      });
    });

    describe('canRemoveMembers', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canRemoveMembers('org-123');

        expect(result).toBe(true);
      });
    });

    describe('canUpdateMemberRoles', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canUpdateMemberRoles('org-123');

        expect(result).toBe(true);
      });

      it('should return false for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canUpdateMemberRoles('org-123');

        expect(result).toBe(false);
      });
    });

    describe('canDeleteOrganization', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canDeleteOrganization('org-123');

        expect(result).toBe(true);
      });
    });

    describe('API key permissions', () => {
      it('canManageAPIKeys should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canManageAPIKeys('org-123');

        expect(result).toBe(true);
      });
    });

    describe('Billing permissions', () => {
      it('canViewBilling should return true for all members', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('member');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canViewBilling('org-123');

        expect(result).toBe(true);
      });

      it('canUpdateBilling should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canUpdateBilling('org-123');

        expect(result).toBe(true);
      });

      it('canUpdateBilling should return false for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetMember.mockResolvedValue(mockMember);

        const result = await canUpdateBilling('org-123');

        expect(result).toBe(false);
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
      mockGetMember.mockRejectedValue(new Error('Database error'));

      const result = await isOrganizationOwner('org-123');

      expect(result).toBe(false);
    });
  });
});
