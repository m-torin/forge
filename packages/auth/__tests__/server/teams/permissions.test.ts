import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  canDeleteTeam,
  canInviteTeamMembers,
  canManageTeam,
  canManageTeamBilling,
  canManageTeamSettings,
  canRemoveTeamMembers,
  canUpdateTeamMemberRoles,
  canViewTeamMembers,
  hasTeamAccess,
  hasTeamRole,
  isTeamAdmin,
  isTeamOwner,
} from '../../../src/server/teams/permissions';

// Mock the auth module using vi.hoisted
const { mockGetSession, mockGetTeamMember } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockGetTeamMember = vi.fn();
  return { mockGetSession, mockGetTeamMember };
});

vi.mock('../../../server/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
    team: {
      getTeamMember: mockGetTeamMember,
    },
  },
}));

// Mock database
const { mockTeamMemberFindFirst } = vi.hoisted(() => {
  const mockTeamMemberFindFirst = vi.fn();
  return { mockTeamMemberFindFirst };
});

vi.mock('@repo/database/prisma', () => ({
  prisma: {
    teamMember: {
      findFirst: mockTeamMemberFindFirst,
    },
  },
}));

describe('Team Permissions', () => {
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

  const createMockTeamMember = (role: string, overrides = {}) => ({
    id: 'member-123',
    createdAt: new Date(),
    role,
    teamId: 'team-123',
    updatedAt: new Date(),
    userId: 'user-123',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasTeamAccess', () => {
    it('should return true when user has access to team', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('member');

      mockGetSession.mockResolvedValue(mockSession);
      mockTeamMemberFindFirst.mockResolvedValue(mockMember);

      const result = await hasTeamAccess('team-123');

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledWith();
      expect(mockTeamMemberFindFirst).toHaveBeenCalledWith({
        where: {
          teamId: 'team-123',
          userId: 'user-123',
        },
      });
    });

    it('should return false when user is not a member', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockTeamMemberFindFirst.mockResolvedValue(null);

      const result = await hasTeamAccess('team-123');

      expect(result).toBe(false);
      expect(mockGetSession).toHaveBeenCalledWith();
    });

    it('should return false when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await hasTeamAccess('team-123');

      expect(result).toBe(false);
      expect(mockGetSession).toHaveBeenCalledWith();
    });
  });

  describe('hasTeamRole', () => {
    it('should return true when user has exact role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('admin');

      mockGetSession.mockResolvedValue(mockSession);
      mockTeamMemberFindFirst.mockResolvedValue(mockMember);

      const result = await hasTeamRole('team-123', 'admin');

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledWith();
    });

    it('should return true when user has one of multiple roles', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('owner');

      mockGetSession.mockResolvedValue(mockSession);
      mockTeamMemberFindFirst.mockResolvedValue(mockMember);

      const result = await hasTeamRole('team-123', 'owner');

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledWith();
    });

    it('should return false when user does not have required role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('member');

      mockGetSession.mockResolvedValue(mockSession);
      mockTeamMemberFindFirst.mockResolvedValue(mockMember);

      const result = await hasTeamRole('team-123', 'owner');

      expect(result).toBe(false);
      expect(mockGetSession).toHaveBeenCalledWith();
    });
  });

  describe('Role check functions', () => {
    it('isTeamOwner should check for owner role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('owner');

      mockGetSession.mockResolvedValue(mockSession);
      mockTeamMemberFindFirst.mockResolvedValue(mockMember);

      const result = await isTeamOwner('team-123');

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledWith();
    });

    it('isTeamAdmin should check for admin or owner role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('admin');

      mockGetSession.mockResolvedValue(mockSession);
      mockTeamMemberFindFirst.mockResolvedValue(mockMember);

      const result = await isTeamAdmin('team-123');

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledWith();
    });

    it('isTeamAdmin should return true for owner', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('owner');

      mockGetSession.mockResolvedValue(mockSession);
      mockTeamMemberFindFirst.mockResolvedValue(mockMember);

      const result = await isTeamAdmin('team-123');

      expect(result).toBe(true);
      expect(mockGetSession).toHaveBeenCalledWith();
    });
  });

  describe('Permission check functions', () => {
    describe('canManageTeam', () => {
      it('should return true for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canManageTeam('team-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith();
      });

      it('should return true for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canManageTeam('team-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith();
      });

      it('should return false for member', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('member');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canManageTeam('team-123');

        expect(result).toBe(false);
        expect(mockGetSession).toHaveBeenCalledWith();
      });
    });

    describe('canInviteTeamMembers', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canInviteTeamMembers('team-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith();
      });
    });

    describe('canRemoveTeamMembers', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canRemoveTeamMembers('team-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith();
      });
    });

    describe('canUpdateTeamMemberRoles', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canUpdateTeamMemberRoles('team-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith();
      });

      it('should return false for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canUpdateTeamMemberRoles('team-123');

        expect(result).toBe(false);
        expect(mockGetSession).toHaveBeenCalledWith();
      });
    });

    describe('canDeleteTeam', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canDeleteTeam('team-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith();
      });
    });

    describe('canViewTeamMembers', () => {
      it('should return true for all members', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('member');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canViewTeamMembers('team-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith();
      });
    });

    describe('canManageTeamSettings', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canManageTeamSettings('team-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith();
      });
    });

    describe('canManageTeamBilling', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canManageTeamBilling('team-123');

        expect(result).toBe(true);
        expect(mockGetSession).toHaveBeenCalledWith();
      });

      it('should return false for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockTeamMemberFindFirst.mockResolvedValue(mockMember);

        const result = await canManageTeamBilling('team-123');

        expect(result).toBe(false);
        expect(mockGetSession).toHaveBeenCalledWith();
      });
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockGetSession.mockRejectedValue(new Error('API error'));

      const result = await hasTeamAccess('team-123');

      expect(result).toBe(false);
    });

    it('should handle missing session gracefully', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await canManageTeam('team-123');

      expect(result).toBe(false);
      expect(mockGetSession).toHaveBeenCalledWith();
    });

    it('should handle member lookup errors gracefully', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockTeamMemberFindFirst.mockRejectedValue(new Error('Database error'));

      const result = await isTeamOwner('team-123');

      expect(result).toBe(false);
      expect(mockGetSession).toHaveBeenCalledWith();
    });
  });
});
