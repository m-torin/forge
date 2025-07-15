import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocking
import {
  banUserAction,
  bulkBanUsersAction,
  bulkDeleteUsersAction,
  bulkUnbanUsersAction,
  bulkUpdateUserRolesAction,
  checkAdminPermissionAction,
  checkRolePermissionAction,
  createUserAction,
  deleteSessionAction,
  deleteUserAction,
  generateAdminReportAction,
  getSystemStatsAction,
  impersonateUserAction,
  listApiKeysAction,
  listUsersAction,
  listUserSessionsAction,
  performSystemMaintenanceAction,
  revokeUserSessionsAction,
  setUserRoleAction,
  stopImpersonatingAction,
  unbanUserAction,
  updateUserAction,
} from '../../src/server/admin-management';

// Mock the auth module using vi.hoisted
const {
  mockListApiKeys,
  mockSignOut,
  mockRemoveUser,
  mockDeleteSession,
  mockRevokeSession,
  mockCreateUser,
  mockUpdateUser,
  mockListUsers,
  mockBanUser,
  mockUnbanUser,
  mockListUserSessions,
  mockRevokeUserSessions,
  mockImpersonateUser,
  mockStopImpersonating,
  mockSetRole,
  mockHasPermission,
  mockCheckRolePermission,
  mockListInvitations,
  mockListOrganizations,
  mockGetSystemStats,
  mockMaintenance,
} = vi.hoisted(() => {
  const mockListApiKeys = vi.fn();
  const mockSignOut = vi.fn();
  const mockRemoveUser = vi.fn();
  const mockDeleteSession = vi.fn();
  const mockRevokeSession = vi.fn();
  const mockCreateUser = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockListUsers = vi.fn();
  const mockBanUser = vi.fn();
  const mockUnbanUser = vi.fn();
  const mockListUserSessions = vi.fn();
  const mockRevokeUserSessions = vi.fn();
  const mockImpersonateUser = vi.fn();
  const mockStopImpersonating = vi.fn();
  const mockSetRole = vi.fn();
  const mockHasPermission = vi.fn();
  const mockCheckRolePermission = vi.fn();
  const mockListInvitations = vi.fn();
  const mockListOrganizations = vi.fn();
  const mockGetSystemStats = vi.fn();
  const mockMaintenance = vi.fn();

  return {
    mockListApiKeys,
    mockSignOut,
    mockRemoveUser,
    mockDeleteSession,
    mockRevokeSession,
    mockCreateUser,
    mockUpdateUser,
    mockListUsers,
    mockBanUser,
    mockUnbanUser,
    mockListUserSessions,
    mockRevokeUserSessions,
    mockImpersonateUser,
    mockStopImpersonating,
    mockSetRole,
    mockHasPermission,
    mockCheckRolePermission,
    mockListInvitations,
    mockListOrganizations,
    mockGetSystemStats,
    mockMaintenance,
  };
});

vi.mock('../../src/shared/auth', () => ({
  auth: {
    api: {
      listApiKeys: mockListApiKeys,
      signOut: mockSignOut,
      removeUser: mockRemoveUser,
      deleteSession: mockDeleteSession,
      revokeSession: mockRevokeSession,
      createUser: mockCreateUser,
      updateUser: mockUpdateUser,
      listUsers: mockListUsers,
      banUser: mockBanUser,
      unbanUser: mockUnbanUser,
      listUserSessions: mockListUserSessions,
      revokeUserSessions: mockRevokeUserSessions,
      impersonateUser: mockImpersonateUser,
      stopImpersonating: mockStopImpersonating,
      setRole: mockSetRole,
      hasPermission: mockHasPermission,
      checkRolePermission: mockCheckRolePermission,
      listInvitations: mockListInvitations,
      listOrganizations: mockListOrganizations,
      getSystemStats: mockGetSystemStats,
      maintenance: mockMaintenance,
    },
  },
}));

describe('admin Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listApiKeys', () => {
    test('should return API keys successfully', async () => {
      const mockApiKeys = [
        { id: 'key-1', name: 'Test Key 1', createdAt: new Date() },
        { id: 'key-2', name: 'Test Key 2', createdAt: new Date() },
      ];

      mockListApiKeys.mockResolvedValue(mockApiKeys);

      const result = await listApiKeysAction();

      expect(result).toStrictEqual({
        data: mockApiKeys,
        success: true,
      });
      expect(mockListApiKeys).toHaveBeenCalledWith({
        headers: expect.objectContaining({}),
      });
    });

    test('should handle API errors', async () => {
      mockListApiKeys.mockResolvedValue(null);

      const result = await listApiKeysAction();

      expect(result).toStrictEqual({
        data: [],
        success: true,
      });
    });

    test('should handle exceptions', async () => {
      mockListApiKeys.mockRejectedValue(new Error('Network error'));

      const result = await listApiKeysAction();

      expect(result).toStrictEqual({
        error: 'Failed to list API keys',
        success: false,
      });
    });

    test('should return empty array when no API keys exist', async () => {
      mockListApiKeys.mockResolvedValue([]);

      const result = await listApiKeysAction();

      expect(result).toStrictEqual({
        data: [],
        success: true,
      });
    });
  });

  describe('deleteSession', () => {
    test('should delete current session when no sessionId provided', async () => {
      mockSignOut.mockResolvedValue({
        success: true,
      });

      const result = await deleteSessionAction();

      expect(result).toStrictEqual({
        success: true,
      });
      expect(mockSignOut).toHaveBeenCalledWith({
        headers: expect.objectContaining({}),
      });
    });

    test('should handle sign out errors', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      const result = await deleteSessionAction();

      expect(result).toStrictEqual({
        error: 'Sign out failed',
        success: false,
      });
    });

    test('should handle sign out exceptions', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));

      const result = await deleteSessionAction();

      expect(result).toStrictEqual({
        error: 'Network error',
        success: false,
      });
    });
  });

  describe('deleteUser', () => {
    test('should return not implemented error', async () => {
      mockRemoveUser.mockRejectedValue(new Error('Failed to delete user'));

      const result = await deleteUserAction('user-123');

      expect(result).toStrictEqual({
        error: 'Failed to delete user',
        success: false,
      });
    });

    test('should handle missing userId', async () => {
      mockRemoveUser.mockRejectedValue(new Error('Failed to delete user'));

      const result = await deleteUserAction('');

      expect(result).toStrictEqual({
        error: 'Failed to delete user',
        success: false,
      });
    });
  });

  describe('createUser', () => {
    test('should create user successfully with minimal data', async () => {
      const userData = { id: 'user-123', email: 'test@example.com' };
      mockCreateUser.mockResolvedValue(userData);

      const result = await createUserAction({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toStrictEqual({
        success: true,
        user: userData,
      });
      expect(mockCreateUser).toHaveBeenCalledWith({
        body: {
          email: 'test@example.com',
          password: 'password123',
          name: 'test',
          emailVerified: false,
        },
        headers: expect.objectContaining({}),
      });
    });

    test('should create user successfully with all data', async () => {
      const userData = { id: 'user-123', email: 'test@example.com' };
      mockCreateUser.mockResolvedValue(userData);

      const result = await createUserAction({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        emailVerified: true,
        role: 'admin',
      });

      expect(result).toStrictEqual({
        success: true,
        user: userData,
      });
    });

    test('should handle create user errors', async () => {
      mockCreateUser.mockRejectedValue(new Error('Create failed'));

      const result = await createUserAction({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to create user',
      });
    });
  });

  describe('updateUser', () => {
    test('should update user successfully', async () => {
      const userData = { id: 'user-123', name: 'Updated User' };
      mockUpdateUser.mockResolvedValue(userData);

      const result = await updateUserAction('user-123', {
        name: 'Updated User',
        email: 'updated@example.com',
      });

      expect(result).toStrictEqual({
        success: true,
        user: userData,
      });
      expect(mockUpdateUser).toHaveBeenCalledWith({
        body: {
          userId: 'user-123',
          data: {
            name: 'Updated User',
            email: 'updated@example.com',
          },
        },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle update user errors', async () => {
      mockUpdateUser.mockRejectedValue(new Error('Update failed'));

      const result = await updateUserAction('user-123', { name: 'Updated' });

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to update user',
      });
    });
  });

  describe('listUsers', () => {
    test('should list users successfully with default pagination', async () => {
      const users = [{ id: 'user-1' }, { id: 'user-2' }];
      mockListUsers.mockResolvedValue({ users, total: 2 });

      const result = await listUsersAction();

      expect(result).toStrictEqual({
        success: true,
        users,
        total: 2,
        page: 1,
        limit: 50,
      });
      expect(mockListUsers).toHaveBeenCalledWith({
        query: { page: 1, limit: 50 },
        headers: expect.objectContaining({}),
      });
    });

    test('should list users with custom pagination and filters', async () => {
      const users = [{ id: 'user-1' }];
      mockListUsers.mockResolvedValue({ users, total: 1 });

      const result = await listUsersAction({
        page: 2,
        limit: 25,
        search: 'test',
        role: 'admin',
        status: 'active',
      });

      expect(result).toStrictEqual({
        success: true,
        users,
        total: 1,
        page: 2,
        limit: 25,
      });
    });

    test('should handle array response format', async () => {
      const users = [{ id: 'user-1' }, { id: 'user-2' }];
      mockListUsers.mockResolvedValue(users);

      const result = await listUsersAction();

      expect(result).toStrictEqual({
        success: true,
        users,
        total: 2,
        page: 1,
        limit: 50,
      });
    });

    test('should handle list users errors', async () => {
      mockListUsers.mockRejectedValue(new Error('List failed'));

      const result = await listUsersAction();

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to list users',
      });
    });
  });

  describe('banUser', () => {
    test('should ban user successfully with reason', async () => {
      mockBanUser.mockResolvedValue(undefined);

      const result = await banUserAction('user-123', 'Violation of terms');

      expect(result).toStrictEqual({ success: true });
      expect(mockBanUser).toHaveBeenCalledWith({
        body: {
          userId: 'user-123',
          reason: 'Violation of terms',
        },
        headers: expect.objectContaining({}),
      });
    });

    test('should ban user successfully without reason', async () => {
      mockBanUser.mockResolvedValue(undefined);

      const result = await banUserAction('user-123');

      expect(result).toStrictEqual({ success: true });
      expect(mockBanUser).toHaveBeenCalledWith({
        body: {
          userId: 'user-123',
        },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle ban user errors', async () => {
      mockBanUser.mockRejectedValue(new Error('Ban failed'));

      const result = await banUserAction('user-123');

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to ban user',
      });
    });
  });

  describe('unbanUser', () => {
    test('should unban user successfully', async () => {
      mockUnbanUser.mockResolvedValue(undefined);

      const result = await unbanUserAction('user-123');

      expect(result).toStrictEqual({ success: true });
      expect(mockUnbanUser).toHaveBeenCalledWith({
        body: { userId: 'user-123' },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle unban user errors', async () => {
      mockUnbanUser.mockRejectedValue(new Error('Unban failed'));

      const result = await unbanUserAction('user-123');

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to unban user',
      });
    });
  });

  describe('listUserSessions', () => {
    test('should list user sessions successfully', async () => {
      const sessions = [{ id: 'session-1' }, { id: 'session-2' }];
      mockListUserSessions.mockResolvedValue(sessions);

      const result = await listUserSessionsAction('user-123');

      expect(result).toStrictEqual({
        success: true,
        sessions,
      });
      expect(mockListUserSessions).toHaveBeenCalledWith({
        query: { userId: 'user-123' },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle non-array response', async () => {
      mockListUserSessions.mockResolvedValue({ session: 'single' });

      const result = await listUserSessionsAction('user-123');

      expect(result).toStrictEqual({
        success: true,
        sessions: [],
      });
    });

    test('should handle list sessions errors', async () => {
      mockListUserSessions.mockRejectedValue(new Error('List failed'));

      const result = await listUserSessionsAction('user-123');

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to list user sessions',
      });
    });
  });

  describe('revokeUserSessions', () => {
    test('should revoke user sessions successfully', async () => {
      mockRevokeUserSessions.mockResolvedValue({ revokedCount: 3 });

      const result = await revokeUserSessionsAction('user-123');

      expect(result).toStrictEqual({
        success: true,
        revokedCount: 3,
      });
      expect(mockRevokeUserSessions).toHaveBeenCalledWith({
        body: { userId: 'user-123' },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle missing revokedCount', async () => {
      mockRevokeUserSessions.mockResolvedValue({});

      const result = await revokeUserSessionsAction('user-123');

      expect(result).toStrictEqual({
        success: true,
        revokedCount: 0,
      });
    });

    test('should handle revoke sessions errors', async () => {
      mockRevokeUserSessions.mockRejectedValue(new Error('Revoke failed'));

      const result = await revokeUserSessionsAction('user-123');

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to revoke user sessions',
      });
    });
  });

  describe('impersonateUser', () => {
    test('should impersonate user successfully', async () => {
      const sessionData = { sessionId: 'session-123', token: 'token-123' };
      mockImpersonateUser.mockResolvedValue(sessionData);

      const result = await impersonateUserAction('user-123');

      expect(result).toStrictEqual({
        success: true,
        ...sessionData,
      });
      expect(mockImpersonateUser).toHaveBeenCalledWith({
        body: { userId: 'user-123' },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle impersonate errors', async () => {
      mockImpersonateUser.mockRejectedValue(new Error('Impersonate failed'));

      const result = await impersonateUserAction('user-123');

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to impersonate user',
      });
    });
  });

  describe('stopImpersonating', () => {
    test('should stop impersonating successfully', async () => {
      mockStopImpersonating.mockResolvedValue(undefined);

      const result = await stopImpersonatingAction();

      expect(result).toStrictEqual({ success: true });
      expect(mockStopImpersonating).toHaveBeenCalledWith({
        headers: expect.objectContaining({}),
      });
    });

    test('should handle stop impersonating errors', async () => {
      mockStopImpersonating.mockRejectedValue(new Error('Stop failed'));

      const result = await stopImpersonatingAction();

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to stop impersonating',
      });
    });
  });

  describe('setUserRole', () => {
    test('should set user role successfully', async () => {
      mockSetRole.mockResolvedValue(undefined);

      const result = await setUserRoleAction('user-123', 'admin');

      expect(result).toStrictEqual({ success: true });
      expect(mockSetRole).toHaveBeenCalledWith({
        body: {
          userId: 'user-123',
          role: 'admin',
        },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle set role errors', async () => {
      mockSetRole.mockRejectedValue(new Error('Set role failed'));

      const result = await setUserRoleAction('user-123', 'admin');

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to set user role',
      });
    });
  });

  describe('checkAdminPermission', () => {
    test('should check admin permission successfully', async () => {
      mockHasPermission.mockResolvedValue({ hasPermission: true });

      const result = await checkAdminPermissionAction('users.create');

      expect(result).toStrictEqual({
        success: true,
        hasPermission: true,
      });
      expect(mockHasPermission).toHaveBeenCalledWith({
        body: { permission: 'users.create' },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle missing hasPermission field', async () => {
      mockHasPermission.mockResolvedValue({});

      const result = await checkAdminPermissionAction('users.create');

      expect(result).toStrictEqual({
        success: true,
        hasPermission: false,
      });
    });

    test('should handle permission check errors', async () => {
      mockHasPermission.mockRejectedValue(new Error('Permission check failed'));

      const result = await checkAdminPermissionAction('users.create');

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to check admin permission',
      });
    });
  });

  describe('checkRolePermission', () => {
    test('should check role permission successfully', async () => {
      mockCheckRolePermission.mockResolvedValue({ hasPermission: true });

      const result = await checkRolePermissionAction('admin', 'users.delete');

      expect(result).toStrictEqual({
        success: true,
        hasPermission: true,
      });
      expect(mockCheckRolePermission).toHaveBeenCalledWith({
        body: {
          role: 'admin',
          permission: 'users.delete',
        },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle role permission errors', async () => {
      mockCheckRolePermission.mockRejectedValue(new Error('Role check failed'));

      const result = await checkRolePermissionAction('admin', 'users.delete');

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to check role permission',
      });
    });
  });

  describe('bulk operations', () => {
    test('should handle bulkDeleteUsersAction', async () => {
      vi.spyOn(Promise, 'allSettled').mockResolvedValue([
        { status: 'fulfilled', value: { success: true } },
        { status: 'fulfilled', value: { success: false, error: 'User not found' } },
        { status: 'rejected', reason: { message: 'Network error' } },
      ] as any);

      const result = await bulkDeleteUsersAction(['user-1', 'user-2', 'user-3']);

      expect(result.success).toBeTruthy();
      expect(result.results).toHaveLength(3);
      expect(result.results![0]).toStrictEqual({
        userId: 'user-1',
        success: true,
        error: undefined,
      });
      expect(result.results![1]).toStrictEqual({
        userId: 'user-2',
        success: false,
        error: 'User not found',
      });
      expect(result.results![2]).toStrictEqual({
        userId: 'user-3',
        success: false,
        error: 'Network error',
      });
    });

    test('should handle bulkBanUsersAction', async () => {
      vi.spyOn(Promise, 'allSettled').mockResolvedValue([
        { status: 'fulfilled', value: { success: true } },
        { status: 'rejected', reason: { message: 'Ban failed' } },
      ] as any);

      const result = await bulkBanUsersAction(['user-1', 'user-2'], 'Spam');

      expect(result.success).toBeTruthy();
      expect(result.results).toHaveLength(2);
    });

    test('should handle bulkUnbanUsersAction', async () => {
      vi.spyOn(Promise, 'allSettled').mockResolvedValue([
        { status: 'fulfilled', value: { success: true } },
        { status: 'rejected', reason: { message: 'Unban failed' } },
      ] as any);

      const result = await bulkUnbanUsersAction(['user-1', 'user-2']);

      expect(result.success).toBeTruthy();
      expect(result.results).toHaveLength(2);
    });

    test('should handle bulkUpdateUserRolesAction', async () => {
      vi.spyOn(Promise, 'allSettled').mockResolvedValue([
        { status: 'fulfilled', value: { success: true } },
        { status: 'rejected', reason: { message: 'Role update failed' } },
      ] as any);

      const result = await bulkUpdateUserRolesAction([
        { userId: 'user-1', role: 'admin' },
        { userId: 'user-2', role: 'member' },
      ]);

      expect(result.success).toBeTruthy();
      expect(result.results).toHaveLength(2);
    });
  });

  describe('advanced admin functions', () => {
    test('should handle generateAdminReportAction', async () => {
      mockListUsers.mockResolvedValue({ users: [], total: 0 });
      mockListInvitations.mockResolvedValue([]);
      mockListOrganizations.mockResolvedValue([]);

      const result = await generateAdminReportAction();

      expect(result.success).toBeTruthy();
      expect(result.report).toBeDefined();
      expect(result.report?.totalUsers).toBeDefined();
      expect(result.report?.totalInvitations).toBeDefined();
      expect(result.report?.totalOrganizations).toBeDefined();
    });

    test('should handle performSystemMaintenanceAction', async () => {
      mockMaintenance.mockResolvedValue({ completed: true });

      const result = await performSystemMaintenanceAction('cleanup');

      expect(result.success).toBeTruthy();
      expect(mockMaintenance).toHaveBeenCalledWith({
        body: { operation: 'cleanup' },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle getSystemStatsAction', async () => {
      const stats = {
        activeUsers: 100,
        totalSessions: 150,
        systemLoad: 0.75,
      };
      mockGetSystemStats.mockResolvedValue(stats);

      const result = await getSystemStatsAction();

      expect(result).toStrictEqual({
        success: true,
        stats,
      });
      expect(mockGetSystemStats).toHaveBeenCalledWith({
        headers: expect.objectContaining({}),
      });
    });

    test('should handle admin function errors', async () => {
      mockGetSystemStats.mockRejectedValue(new Error('Stats failed'));

      const result = await getSystemStatsAction();

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to get system stats',
      });
    });
  });

  describe('deleteSession with sessionId', () => {
    test('should delete specific session when sessionId provided', async () => {
      mockRevokeSession.mockResolvedValue(undefined);

      const result = await deleteSessionAction('session-123');

      expect(result).toStrictEqual({ success: true });
      expect(mockRevokeSession).toHaveBeenCalledWith({
        body: { sessionId: 'session-123' },
        headers: expect.objectContaining({}),
      });
    });

    test('should handle revoke session errors', async () => {
      mockRevokeSession.mockRejectedValue(new Error('Revoke session failed'));

      const result = await deleteSessionAction('session-123');

      expect(result).toStrictEqual({
        success: false,
        error: 'Failed to delete session',
      });
    });
  });
});
