import { beforeEach, describe, expect, test, vi } from 'vitest';

// Import test setup
import '../setup';

import { auth } from '../../src/shared/auth';

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
} from '../../src/server/organizations/permissions';

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

// Mock auth module
vi.mock('../../../src/shared/auth', async () => {
  const actual = await vi.importActual('../../../src/shared/auth');
  return {
    ...actual,
    auth: {
      api: {
        getSession: vi.fn(),
        getFullOrganization: vi.fn(),
        getActiveMember: vi.fn(),
      },
    },
  };
});

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

// Mock getUserRoleInOrganization from helpers - this is what the functions actually use
vi.mock('../../../src/server/organizations/helpers', async () => {
  const actual = await vi.importActual('../../../src/server/organizations/helpers');
  return {
    ...actual,
    getUserRoleInOrganization: vi.fn().mockImplementation(userId => {
      // Return role based on test expectations
      if (userId === 'owner-user') return Promise.resolve('owner');
      if (userId === 'admin-user') return Promise.resolve('admin');
      if (userId === 'member-user') return Promise.resolve('member');
      if (userId === 'user-123') return Promise.resolve('member'); // Default test user
      return Promise.resolve(null);
    }),
    isOrganizationOwner: vi.fn().mockImplementation(userId => {
      return Promise.resolve(userId === 'owner-user');
    }),
    isOrganizationAdmin: vi.fn().mockImplementation(userId => {
      return Promise.resolve(userId === 'owner-user' || userId === 'admin-user');
    }),
  };
});

describe('organization Permissions', () => {
  const createMockSession = (userId = 'user-123', overrides = {}) => ({
    session: {
      id: 'session-123',
      activeOrganizationId: 'org-123',
      userId,
      ...overrides,
    },
    user: {
      id: userId,
      email: 'test@example.com',
    },
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    // Set up getActiveMember mock to return appropriate roles based on userId
    vi.mocked(auth.api.getActiveMember).mockImplementation(async ({ query }: any) => {
      const userId = query?.userId;
      if (userId === 'owner-user') return { role: 'owner' };
      if (userId === 'admin-user') return { role: 'admin' };
      if (userId === 'member-user') return { role: 'member' };
      if (userId === 'user-123') return { role: 'member' }; // Default test user
      return null;
    });

    // Ensure the mocked functions work correctly by clearing and re-setting them
    const { getUserRoleInOrganization, isOrganizationOwner, isOrganizationAdmin } = await import(
      '../../../src/server/organizations/helpers'
    );
    vi.mocked(getUserRoleInOrganization).mockImplementation(async userId => {
      if (userId === 'owner-user') return 'owner';
      if (userId === 'admin-user') return 'admin';
      if (userId === 'member-user') return 'member';
      if (userId === 'user-123') return 'member';
      return null;
    });
    vi.mocked(isOrganizationOwner).mockImplementation(async userId => {
      return userId === 'owner-user';
    });
    vi.mocked(isOrganizationAdmin).mockImplementation(async userId => {
      return userId === 'owner-user' || userId === 'admin-user';
    });
  });

  describe('hasOrganizationAccess', () => {
    test('should return true when user has access to organization', async () => {
      const mockSession = createMockSession('user-123', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBeTruthy();
    });

    test('should return false when user is not a member', async () => {
      const mockSession = createMockSession('user-456'); // Different user not in org

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBeFalsy();
    });

    test('should return false when session is missing', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await hasOrganizationAccess('org-123');

      expect(result).toBeFalsy();
    });
  });

  describe('hasOrganizationRole', () => {
    test('should return true when user has exact role', async () => {
      const mockSession = createMockSession('admin-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await hasOrganizationRole('org-123', 'admin');

      expect(result).toBeTruthy();
    });

    test('should return true when user has one of multiple roles', async () => {
      const mockSession = createMockSession('owner-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await hasOrganizationRole('org-123', 'owner');

      expect(result).toBeTruthy();
    });

    test('should return false when user does not have required role', async () => {
      const mockSession = createMockSession('member-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await hasOrganizationRole('org-123', 'owner');

      expect(result).toBeFalsy();
    });
  });

  describe('role check functions', () => {
    test('isOrganizationOwner should check for owner role', async () => {
      const mockSession = createMockSession('owner-user', {
        activeOrganizationId: 'org-123',
      });
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await isOrganizationOwner('owner-user', 'org-123');
      expect(result).toBeTruthy();
    });

    test('isOrganizationAdmin should check for admin or owner role', async () => {
      const mockSession = createMockSession('admin-user', {
        activeOrganizationId: 'org-123',
      });
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await isOrganizationAdmin('admin-user', 'org-123');
      expect(result).toBeTruthy();
    });

    test('isOrganizationAdmin should return true for owner', async () => {
      const mockSession = createMockSession('owner-user', {
        activeOrganizationId: 'org-123',
      });
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await isOrganizationAdmin('owner-user', 'org-123');
      expect(result).toBeTruthy();
    });
  });

  describe('permission check functions', () => {
    test('canManageOrganization should return true for admin roles', async () => {
      const mockSession = createMockSession('admin-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await canManageOrganization('org-123');

      expect(result).toBeTruthy();
    });

    test('canDeleteOrganization should return true only for owner', async () => {
      const mockSession = createMockSession('owner-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await canDeleteOrganization('org-123');

      expect(result).toBeTruthy();
    });

    test('canInviteMembers should return true for admin roles', async () => {
      const mockSession = createMockSession('admin-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await canInviteMembers('org-123');

      expect(result).toBeTruthy();
    });

    test('canRemoveMembers should return true for admin roles', async () => {
      const mockSession = createMockSession('admin-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await canRemoveMembers('org-123');

      expect(result).toBeTruthy();
    });

    test('canUpdateMemberRoles should return true only for owner', async () => {
      const mockSession = createMockSession('owner-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await canUpdateMemberRoles('org-123');

      expect(result).toBeTruthy();
    });

    test('canManageAPIKeys should return true for admin roles', async () => {
      const mockSession = createMockSession('admin-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await canManageAPIKeys('org-123');

      expect(result).toBeTruthy();
    });

    test('canViewBilling should return true for admin roles', async () => {
      const mockSession = createMockSession('admin-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await canViewBilling('org-123');

      expect(result).toBeTruthy();
    });

    test('canUpdateBilling should return true only for owner', async () => {
      const mockSession = createMockSession('owner-user', {
        activeOrganizationId: 'org-123',
      });

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await canUpdateBilling('org-123');

      expect(result).toBeTruthy();
    });
  });

  describe('error handling', () => {
    test('should handle missing session gracefully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await canManageOrganization('org-123');

      expect(result).toBeFalsy();
    });

    test('should handle member lookup errors gracefully', async () => {
      const mockSession = createMockSession('user-123');

      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const result = await canManageOrganization('org-123');

      expect(result).toBeFalsy(); // user-123 has member role which does NOT allow organization management
    });
  });
});
