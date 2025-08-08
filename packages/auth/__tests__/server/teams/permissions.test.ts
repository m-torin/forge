import { beforeEach, describe, expect, test, vi } from 'vitest';

// Import test setup FIRST
import { auth } from '../../src/shared/auth';
import '../setup';

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
} from '../../src/server/teams/permissions';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock environment
vi.mock('../../../env', () => ({
  safeServerEnv: () => ({
    BETTER_AUTH_SECRET: 'test-secret',
    BETTER_AUTH_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Test App',
    DATABASE_URL: 'test-url',
  }),
}));

// Mock the auth module
vi.mock('../../../src/shared/auth', async () => {
  const actual = await vi.importActual('../../../src/shared/auth');
  return {
    ...actual,
    auth: {
      api: {
        getSession: vi.fn(),
        getTeam: vi.fn(),
      },
    },
  };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

// Mock DEFAULT_TEAM_ROLES for permission checking
vi.mock('../../../src/shared/teams', async importOriginal => {
  const original = await importOriginal<typeof import('../../../src/shared/teams')>();
  return {
    ...original,
    DEFAULT_TEAM_ROLES: {
      owner: { id: 'owner', level: 100, permissions: ['*'] },
      admin: {
        id: 'admin',
        level: 50,
        permissions: ['team:write', 'members:write', 'members:manage'],
      },
      member: { id: 'member', level: 10, permissions: ['team:read', 'members:read'] },
    },
    roleHasPermission: (role: string, permission: string) => {
      const roles: Record<string, string[]> = {
        owner: ['*'],
        admin: ['team:write', 'members:write', 'members:manage', 'settings:write'],
        member: ['team:read', 'members:read'],
      };
      const rolePerms = roles[role] || [];
      return rolePerms.includes('*') || rolePerms.includes(permission);
    },
  };
});

describe('team Permissions', () => {
  const createMockSession = (overrides = {}) => ({
    session: {
      id: 'session-123',
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

  const createMockTeam = (members: any[] = []) => ({
    team: {
      id: 'team-123',
      name: 'Test Team',
      members,
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hasTeamAccess', () => {
    test('should return true when user has access to team', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('member');

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

      const result = await hasTeamAccess('team-123');

      expect(result).toBeTruthy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
      expect(vi.mocked(auth.api.getTeam)).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        query: { teamId: 'team-123' },
      });
    });

    test('should return false when user is not a member', async () => {
      const mockSession = createMockSession();

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([]));

      const result = await hasTeamAccess('team-123');

      expect(result).toBeFalsy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });

    test('should return false when session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await hasTeamAccess('team-123');

      expect(result).toBeFalsy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });
  });

  describe('hasTeamRole', () => {
    test('should return true when user has exact role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('admin');

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

      const result = await hasTeamRole('team-123', 'admin');

      expect(result).toBeTruthy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });

    test('should return true when user has one of multiple roles', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('owner');

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

      const result = await hasTeamRole('team-123', 'owner');

      expect(result).toBeTruthy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });

    test('should return false when user does not have required role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('member');

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

      const result = await hasTeamRole('team-123', 'owner');

      expect(result).toBeFalsy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });
  });

  describe('role check functions', () => {
    test('isTeamOwner should check for owner role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('owner');

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

      const result = await isTeamOwner('team-123');

      expect(result).toBeTruthy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });

    test('isTeamAdmin should check for admin or owner role', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('admin');

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

      const result = await isTeamAdmin('team-123');

      expect(result).toBeTruthy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });

    test('isTeamAdmin should return true for owner', async () => {
      const mockSession = createMockSession();
      const mockMember = createMockTeamMember('owner');

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

      const result = await isTeamAdmin('team-123');

      expect(result).toBeTruthy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });
  });

  describe('permission check functions', () => {
    describe('canManageTeam', () => {
      test('should return true for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canManageTeam('team-123');

        expect(result).toBeTruthy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });

      test('should return true for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canManageTeam('team-123');

        expect(result).toBeTruthy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });

      test('should return false for regular member', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('member');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canManageTeam('team-123');

        expect(result).toBeFalsy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });
    });

    describe('canDeleteTeam', () => {
      test('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canDeleteTeam('team-123');

        expect(result).toBeTruthy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });

      test('should return false for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canDeleteTeam('team-123');

        expect(result).toBeFalsy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });
    });

    describe('canInviteTeamMembers', () => {
      test('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canInviteTeamMembers('team-123');

        expect(result).toBeTruthy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });

      test('should return false for regular member', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('member');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canInviteTeamMembers('team-123');

        expect(result).toBeFalsy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });
    });

    describe('canRemoveTeamMembers', () => {
      test('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canRemoveTeamMembers('team-123');

        expect(result).toBeTruthy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });
    });

    describe('canUpdateTeamMemberRoles', () => {
      test('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canUpdateTeamMemberRoles('team-123');

        expect(result).toBeTruthy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });
    });

    describe('canViewTeamMembers', () => {
      test('should return true for all members', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('member');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canViewTeamMembers('team-123');

        expect(result).toBeTruthy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });
    });

    describe('canManageTeamSettings', () => {
      test('should return true for admin roles', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canManageTeamSettings('team-123');

        expect(result).toBeTruthy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });
    });

    describe('canManageTeamBilling', () => {
      test('should return true only for owner', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('owner');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canManageTeamBilling('team-123');

        expect(result).toBeTruthy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });

      test('should return false for admin', async () => {
        const mockSession = createMockSession();
        const mockMember = createMockTeamMember('admin');

        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
        vi.mocked(auth.api.getTeam).mockResolvedValue(createMockTeam([mockMember]));

        const result = await canManageTeamBilling('team-123');

        expect(result).toBeFalsy();
        expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({
          headers: expect.any(Headers),
        });
      });
    });
  });

  describe('error handling', () => {
    test('should handle missing session gracefully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await canManageTeam('team-123');

      expect(result).toBeFalsy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });

    test('should handle member lookup errors gracefully', async () => {
      const mockSession = createMockSession();

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);
      vi.mocked(auth.api.getTeam).mockRejectedValue(new Error('Team not found'));

      const result = await canManageTeam('team-123');

      expect(result).toBeFalsy();
      expect(vi.mocked(auth.api.getSession)).toHaveBeenCalledWith({ headers: expect.any(Headers) });
    });
  });
});
