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
} from '../../../server/teams/permissions';

import type { TeamMember } from '../../../shared/types';

// Mock the auth module
const mockGetSession = vi.fn();
const mockGetTeamMember = vi.fn();

vi.mock('../../auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
    team: {
      getTeamMember: mockGetTeamMember,
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

  const createMockTeamMember = (role: string, overrides = {}): TeamMember => ({
    id: 'member-123',
    createdAt: new Date(),
    role,
    teamId: 'team-123',
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
      mockGetTeamMember.mockResolvedValue(mockMember);

      const result = await hasTeamAccess(mockHeaders, 'team-123');

      expect(result).toBe(true);
      expect(mockGetTeamMember).toHaveBeenCalledWith({
        query: {
          teamId: 'team-123',
          userId: 'user-123',
        },
      });
    });

    it('should return false when user is not a member', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockGetTeamMember.mockResolvedValue(null);

      const result = await hasTeamAccess(mockHeaders, 'team-123');

      expect(result).toBe(false);
    });

    it('should return false when session is missing', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await hasTeamAccess(mockHeaders, 'team-123');

      expect(result).toBe(false);
    });
  });

  describe('hasTeamRole', () => {
    it('should return true when user has exact role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('admin');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetTeamMember.mockResolvedValue(mockMember);

      const result = await hasTeamRole(mockHeaders, 'team-123', ['admin']);

      expect(result).toBe(true);
    });

    it('should return true when user has one of multiple roles', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('owner');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetTeamMember.mockResolvedValue(mockMember);

      const result = await hasTeamRole(mockHeaders, 'team-123', ['admin', 'owner']);

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('member');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetTeamMember.mockResolvedValue(mockMember);

      const result = await hasTeamRole(mockHeaders, 'team-123', ['admin', 'owner']);

      expect(result).toBe(false);
    });
  });

  describe('Role check functions', () => {
    it('isTeamOwner should check for owner role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('owner');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetTeamMember.mockResolvedValue(mockMember);

      const result = await isTeamOwner(mockHeaders, 'team-123');

      expect(result).toBe(true);
    });

    it('isTeamAdmin should check for admin or owner role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('admin');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetTeamMember.mockResolvedValue(mockMember);

      const result = await isTeamAdmin(mockHeaders, 'team-123');

      expect(result).toBe(true);
    });

    it('isTeamAdmin should return true for owner', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('owner');

      mockGetSession.mockResolvedValue(mockSession);
      mockGetTeamMember.mockResolvedValue(mockMember);

      const result = await isTeamAdmin(mockHeaders, 'team-123');

      expect(result).toBe(true);
    });
  });

  describe('Permission check functions', () => {
    describe('canManageTeam', () => {
      it('should return true for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canManageTeam(mockHeaders, 'team-123');

        expect(result).toBe(true);
      });

      it('should return true for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canManageTeam(mockHeaders, 'team-123');

        expect(result).toBe(true);
      });

      it('should return false for member', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('member');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canManageTeam(mockHeaders, 'team-123');

        expect(result).toBe(false);
      });
    });

    describe('canInviteTeamMembers', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canInviteTeamMembers(mockHeaders, 'team-123');

        expect(result).toBe(true);
      });
    });

    describe('canRemoveTeamMembers', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canRemoveTeamMembers(mockHeaders, 'team-123');

        expect(result).toBe(true);
      });
    });

    describe('canUpdateTeamMemberRoles', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canUpdateTeamMemberRoles(mockHeaders, 'team-123');

        expect(result).toBe(true);
      });

      it('should return false for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canUpdateTeamMemberRoles(mockHeaders, 'team-123');

        expect(result).toBe(false);
      });
    });

    describe('canDeleteTeam', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canDeleteTeam(mockHeaders, 'team-123');

        expect(result).toBe(true);
      });
    });

    describe('canViewTeamMembers', () => {
      it('should return true for all members', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('member');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canViewTeamMembers(mockHeaders, 'team-123');

        expect(result).toBe(true);
      });
    });

    describe('canManageTeamSettings', () => {
      it('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canManageTeamSettings(mockHeaders, 'team-123');

        expect(result).toBe(true);
      });
    });

    describe('canManageTeamBilling', () => {
      it('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canManageTeamBilling(mockHeaders, 'team-123');

        expect(result).toBe(true);
      });

      it('should return false for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        mockGetSession.mockResolvedValue(mockSession);
        mockGetTeamMember.mockResolvedValue(mockMember);

        const result = await canManageTeamBilling(mockHeaders, 'team-123');

        expect(result).toBe(false);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockGetSession.mockRejectedValue(new Error('API error'));

      const result = await hasTeamAccess(mockHeaders, 'team-123');

      expect(result).toBe(false);
    });

    it('should handle missing session gracefully', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await canManageTeam(mockHeaders, 'team-123');

      expect(result).toBe(false);
    });

    it('should handle member lookup errors gracefully', async () => {
      const mockSession = createMockSession();

      mockGetSession.mockResolvedValue(mockSession);
      mockGetTeamMember.mockRejectedValue(new Error('Database error'));

      const result = await isTeamOwner(mockHeaders, 'team-123');

      expect(result).toBe(false);
    });
  });
});
