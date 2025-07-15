/**
 * Tests for server actions
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock next/headers
const mockHeaders = vi.fn(() => new Headers());
vi.mock('next/headers', () => ({
  headers: mockHeaders,
}));

// Mock database
const mockPrisma = {
  user: {
    findMany: vi.fn(),
  },
};

vi.mock('@repo/database/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock auth module
const mockAuth = {
  api: {
    getSession: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    changePassword: vi.fn(),
    setPassword: vi.fn(),
    revokeSession: vi.fn(),
    listSessions: vi.fn(),
    listAccounts: vi.fn(),
    unlinkAccount: vi.fn(),
    createOrganization: vi.fn(),
    updateOrganization: vi.fn(),
    deleteOrganization: vi.fn(),
    listOrganizations: vi.fn(),
    getOrganization: vi.fn(),
    setActiveOrganization: vi.fn(),
    listInvitations: vi.fn(),
    listApiKeys: vi.fn(),
    createApiKey: vi.fn(),
    updateApiKey: vi.fn(),
    deleteApiKey: vi.fn(),
    getApiKey: vi.fn(),
    enableTwoFactor: vi.fn(),
    disableTwoFactor: vi.fn(),
    getTwoFactorBackupCodes: vi.fn(),
    listPasskeys: vi.fn(),
    generatePasskeyRegistrationOptions: vi.fn(),
    deletePasskey: vi.fn(),
    removeUser: vi.fn(),
    createUser: vi.fn(),
    setRole: vi.fn(),
    revokeUserSessions: vi.fn(),
    getFullOrganization: vi.fn(),
    sendInvitation: vi.fn(),
    admin: {
      banUser: vi.fn(),
      unbanUser: vi.fn(),
      impersonateUser: vi.fn(),
      stopImpersonating: vi.fn(),
    },
  },
};

vi.mock('../src/shared/auth', () => ({
  auth: mockAuth,
}));

describe('server actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders.mockReturnValue(new Headers());
  });

  describe('user management', () => {
    it('should get current user successfully', async () => {
      const { getCurrentUserAction } = await import('../src/server-actions');

      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      mockAuth.api.getSession.mockResolvedValue({ user: mockUser });

      const result = await getCurrentUserAction();

      expect(result).toEqual(mockUser);
      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
    });

    it('should return null when no user session', async () => {
      const { getCurrentUserAction } = await import('../src/server-actions');

      mockAuth.api.getSession.mockResolvedValue(null);

      const result = await getCurrentUserAction();

      expect(result).toBeNull();
    });

    it('should update user successfully', async () => {
      const { updateUserAction } = await import('../src/server-actions');

      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { user: mockUser };
      mockAuth.api.getSession.mockResolvedValue(mockSession);
      mockAuth.api.updateUser.mockResolvedValue({ ...mockUser, name: 'Updated Name' });

      const result = await updateUserAction({ name: 'Updated Name' });

      expect(mockAuth.api.updateUser).toHaveBeenCalledWith({
        body: {
          name: 'Updated Name',
          userId: 'user-123',
        },
        headers: expect.any(Headers),
      });
    });

    it('should throw error when updating user without authentication', async () => {
      const { updateUserAction } = await import('../src/server-actions');

      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(updateUserAction({ name: 'Test' })).rejects.toThrow('Not authenticated');
    });

    it('should delete user successfully', async () => {
      const { deleteUserAction } = await import('../src/server-actions');

      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuth.api.getSession.mockResolvedValue({ user: mockUser });
      mockAuth.api.deleteUser.mockResolvedValue({ success: true });

      const result = await deleteUserAction();

      expect(mockAuth.api.deleteUser).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
    });

    it('should throw error when deleting user without authentication', async () => {
      const { deleteUserAction } = await import('../src/server-actions');

      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(deleteUserAction()).rejects.toThrow('Not authenticated');
    });
  });

  describe('password management', () => {
    it('should change password successfully', async () => {
      const { changePasswordAction } = await import('../src/server-actions');

      const passwordData = {
        currentPassword: 'old-password',
        newPassword: 'new-password',
        revokeOtherSessions: true,
      };
      mockAuth.api.changePassword.mockResolvedValue({ success: true });

      const result = await changePasswordAction(passwordData);

      expect(mockAuth.api.changePassword).toHaveBeenCalledWith({
        body: passwordData,
        headers: expect.any(Headers),
      });
    });

    it('should set password successfully', async () => {
      const { setPasswordAction } = await import('../src/server-actions');

      mockAuth.api.setPassword.mockResolvedValue({ success: true });

      const result = await setPasswordAction('new-password');

      expect(mockAuth.api.setPassword).toHaveBeenCalledWith({
        body: { newPassword: 'new-password' },
        headers: expect.any(Headers),
      });
    });
  });

  describe('session management', () => {
    it('should get session successfully', async () => {
      const { getSessionAction } = await import('../src/server-actions');

      const mockSession = { id: 'session-123', userId: 'user-123' };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await getSessionAction();

      expect(result).toEqual(mockSession);
      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
    });

    it('should delete session successfully', async () => {
      const { deleteSessionAction } = await import('../src/server-actions');

      mockAuth.api.revokeSession.mockResolvedValue({ success: true });

      const result = await deleteSessionAction('session-123');

      expect(mockAuth.api.revokeSession).toHaveBeenCalledWith({
        body: { sessionId: 'session-123' },
        headers: expect.any(Headers),
      });
    });

    it('should list sessions successfully', async () => {
      const { listSessionsAction } = await import('../src/server-actions');

      const mockSessions = [{ id: 'session-1' }, { id: 'session-2' }];
      mockAuth.api.listSessions.mockResolvedValue(mockSessions);

      const result = await listSessionsAction();

      expect(result).toEqual(mockSessions);
      expect(mockAuth.api.listSessions).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
    });
  });

  describe('account management', () => {
    it('should list accounts successfully', async () => {
      const { listAccountsAction } = await import('../src/server-actions');

      const mockAccounts = [{ id: 'account-1', providerId: 'google' }];
      mockAuth.api.listAccounts.mockResolvedValue(mockAccounts);

      const result = await listAccountsAction();

      expect(result).toEqual(mockAccounts);
    });

    it('should unlink account successfully', async () => {
      const { unlinkAccountAction } = await import('../src/server-actions');

      mockAuth.api.unlinkAccount.mockResolvedValue({ success: true });

      const result = await unlinkAccountAction({ providerId: 'google' });

      expect(mockAuth.api.unlinkAccount).toHaveBeenCalledWith({
        body: { providerId: 'google' },
        headers: expect.any(Headers),
      });
    });
  });

  describe('organization management', () => {
    it('should create organization successfully', async () => {
      const { createOrganizationAction } = await import('../src/server-actions');

      const orgData = { name: 'Test Org', slug: 'test-org' };
      const mockOrg = { id: 'org-123', ...orgData };
      mockAuth.api.createOrganization.mockResolvedValue(mockOrg);

      const result = await createOrganizationAction(orgData);

      expect(mockAuth.api.createOrganization).toHaveBeenCalledWith({
        body: orgData,
        headers: expect.any(Headers),
      });
    });

    it('should update organization successfully', async () => {
      const { updateOrganizationAction } = await import('../src/server-actions');

      const updateData = { organizationId: 'org-123', name: 'Updated Org' };
      mockAuth.api.updateOrganization.mockResolvedValue({ success: true });

      const result = await updateOrganizationAction(updateData);

      expect(mockAuth.api.updateOrganization).toHaveBeenCalledWith({
        body: updateData,
        headers: expect.any(Headers),
      });
    });

    it('should delete organization successfully', async () => {
      const { deleteOrganizationAction } = await import('../src/server-actions');

      mockAuth.api.deleteOrganization.mockResolvedValue({ success: true });

      const result = await deleteOrganizationAction('org-123');

      expect(mockAuth.api.deleteOrganization).toHaveBeenCalledWith({
        body: { organizationId: 'org-123' },
        headers: expect.any(Headers),
      });
    });

    it('should list user organizations successfully', async () => {
      const { listUserOrganizationsAction } = await import('../src/server-actions');

      const mockOrgs = [{ id: 'org-1' }, { id: 'org-2' }];
      mockAuth.api.listOrganizations.mockResolvedValue(mockOrgs);

      const result = await listUserOrganizationsAction();

      expect(result).toEqual(mockOrgs);
    });

    it('should get active organization successfully', async () => {
      const { getActiveOrganizationAction } = await import('../src/server-actions');

      const mockSession = { session: { activeOrganizationId: 'org-123' } };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await getActiveOrganizationAction();

      expect(result).toBe('org-123');
    });

    it('should return null when no active organization', async () => {
      const { getActiveOrganizationAction } = await import('../src/server-actions');

      mockAuth.api.getSession.mockResolvedValue({ session: {} });

      const result = await getActiveOrganizationAction();

      expect(result).toBeNull();
    });

    it('should get organization by id successfully', async () => {
      const { getOrganizationByIdAction } = await import('../src/server-actions');

      const mockOrg = { id: 'org-123', name: 'Test Org' };
      mockAuth.api.getOrganization.mockResolvedValue(mockOrg);

      const result = await getOrganizationByIdAction('org-123');

      expect(mockAuth.api.getOrganization).toHaveBeenCalledWith({
        query: { organizationId: 'org-123' },
        headers: expect.any(Headers),
      });
    });

    it('should set active organization successfully', async () => {
      const { setActiveOrganizationAction } = await import('../src/server-actions');

      mockAuth.api.setActiveOrganization.mockResolvedValue({ success: true });

      const result = await setActiveOrganizationAction('org-123');

      expect(mockAuth.api.setActiveOrganization).toHaveBeenCalledWith({
        body: { organizationId: 'org-123' },
        headers: expect.any(Headers),
      });
    });

    it('should list organization invitations with organizationId', async () => {
      const { listOrganizationInvitationsAction } = await import('../src/server-actions');

      const mockInvitations = [{ id: 'inv-1' }];
      mockAuth.api.listInvitations.mockResolvedValue(mockInvitations);

      const result = await listOrganizationInvitationsAction('org-123');

      expect(mockAuth.api.listInvitations).toHaveBeenCalledWith({
        query: { organizationId: 'org-123' },
        headers: expect.any(Headers),
      });
    });

    it('should list organization invitations without organizationId', async () => {
      const { listOrganizationInvitationsAction } = await import('../src/server-actions');

      const mockInvitations = [{ id: 'inv-1' }];
      mockAuth.api.listInvitations.mockResolvedValue(mockInvitations);

      const result = await listOrganizationInvitationsAction();

      expect(mockAuth.api.listInvitations).toHaveBeenCalledWith({
        query: {},
        headers: expect.any(Headers),
      });
    });
  });

  describe('api key management', () => {
    it('should list api keys successfully', async () => {
      const { listApiKeysAction } = await import('../src/server-actions');

      const mockKeys = [{ id: 'key-1', name: 'Test Key' }];
      mockAuth.api.listApiKeys.mockResolvedValue(mockKeys);

      const result = await listApiKeysAction();

      expect(result).toEqual(mockKeys);
    });

    it('should create api key successfully', async () => {
      const { createApiKeyAction } = await import('../src/server-actions');

      const keyData = { name: 'Test Key', scopes: ['read'] };
      const mockKey = { id: 'key-123', ...keyData };
      mockAuth.api.createApiKey.mockResolvedValue(mockKey);

      const result = await createApiKeyAction(keyData);

      expect(mockAuth.api.createApiKey).toHaveBeenCalledWith({
        body: keyData,
        headers: expect.any(Headers),
      });
    });

    it('should update api key successfully', async () => {
      const { updateApiKeyAction } = await import('../src/server-actions');

      const updateData = { id: 'key-123', name: 'Updated Key' };
      mockAuth.api.updateApiKey.mockResolvedValue({ success: true });

      const result = await updateApiKeyAction(updateData);

      expect(mockAuth.api.updateApiKey).toHaveBeenCalledWith({
        body: updateData,
        headers: expect.any(Headers),
      });
    });

    it('should delete api key successfully', async () => {
      const { deleteApiKeyAction } = await import('../src/server-actions');

      mockAuth.api.deleteApiKey.mockResolvedValue({ success: true });

      const result = await deleteApiKeyAction('key-123');

      expect(mockAuth.api.deleteApiKey).toHaveBeenCalledWith({
        body: { id: 'key-123' },
        headers: expect.any(Headers),
      });
    });

    it('should get api key successfully', async () => {
      const { getApiKeyAction } = await import('../src/server-actions');

      const mockKey = { id: 'key-123', name: 'Test Key' };
      mockAuth.api.getApiKey.mockResolvedValue(mockKey);

      const result = await getApiKeyAction('key-123');

      expect(mockAuth.api.getApiKey).toHaveBeenCalledWith({
        query: { id: 'key-123' },
        headers: expect.any(Headers),
      });
    });

    it('should bulk create api keys successfully', async () => {
      const { bulkCreateApiKeysAction } = await import('../src/server-actions');

      mockAuth.api.createApiKey
        .mockResolvedValueOnce({ id: 'key-1', name: 'API Key 1' })
        .mockResolvedValueOnce({ id: 'key-2', name: 'API Key 2' });

      const result = await bulkCreateApiKeysAction({
        count: 2,
        prefix: 'API Key',
        scopes: ['read'],
      });

      expect(result).toHaveLength(2);
      expect(mockAuth.api.createApiKey).toHaveBeenCalledTimes(2);
    });

    it('should get api key statistics successfully', async () => {
      const { getApiKeyStatisticsAction } = await import('../src/server-actions');

      const mockKeys = [
        { id: 'key-1', expiresAt: new Date(Date.now() + 86400000).toISOString() }, // Future
        { id: 'key-2', expiresAt: new Date(Date.now() - 86400000).toISOString() }, // Past
        { id: 'key-3' }, // No expiration
      ];
      mockAuth.api.listApiKeys.mockResolvedValue(mockKeys);

      const result = await getApiKeyStatisticsAction();

      expect(result).toEqual({
        total: 3,
        active: 2, // Future + no expiration
        expired: 1, // Past
      });
    });

    it('should handle empty api keys list in statistics', async () => {
      const { getApiKeyStatisticsAction } = await import('../src/server-actions');

      mockAuth.api.listApiKeys.mockResolvedValue([]);

      const result = await getApiKeyStatisticsAction();

      expect(result).toEqual({
        total: 0,
        active: 0,
        expired: 0,
      });
    });
  });

  describe('two factor authentication', () => {
    it('should get two factor status successfully', async () => {
      const { getTwoFactorStatusAction } = await import('../src/server-actions');

      const mockSession = { user: { twoFactorEnabled: true } };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await getTwoFactorStatusAction();

      expect(result).toEqual({ enabled: true });
    });

    it('should return false when two factor not enabled', async () => {
      const { getTwoFactorStatusAction } = await import('../src/server-actions');

      const mockSession = { user: { twoFactorEnabled: false } };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await getTwoFactorStatusAction();

      expect(result).toEqual({ enabled: false });
    });

    it('should handle missing user in session', async () => {
      const { getTwoFactorStatusAction } = await import('../src/server-actions');

      mockAuth.api.getSession.mockResolvedValue({});

      const result = await getTwoFactorStatusAction();

      expect(result).toEqual({ enabled: false });
    });

    it('should enable two factor successfully', async () => {
      const { enableTwoFactorAction } = await import('../src/server-actions');

      const mockResult = { secret: 'secret123', qrCode: 'qr-data' };
      mockAuth.api.enableTwoFactor.mockResolvedValue(mockResult);

      const result = await enableTwoFactorAction();

      expect(mockAuth.api.enableTwoFactor).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
    });

    it('should disable two factor successfully', async () => {
      const { disableTwoFactorAction } = await import('../src/server-actions');

      mockAuth.api.disableTwoFactor.mockResolvedValue({ success: true });

      const result = await disableTwoFactorAction({ password: 'password123' });

      expect(mockAuth.api.disableTwoFactor).toHaveBeenCalledWith({
        body: { password: 'password123' },
        headers: expect.any(Headers),
      });
    });

    it('should get backup codes successfully', async () => {
      const { getTwoFactorBackupCodesAction } = await import('../src/server-actions');

      const mockCodes = ['code1', 'code2', 'code3'];
      mockAuth.api.getTwoFactorBackupCodes.mockResolvedValue(mockCodes);

      const result = await getTwoFactorBackupCodesAction();

      expect(result).toEqual(mockCodes);
    });
  });

  describe('passkey management', () => {
    it('should list passkeys successfully', async () => {
      const { listPasskeysAction } = await import('../src/server-actions');

      const mockPasskeys = [{ id: 'pk-1', name: 'iPhone' }];
      mockAuth.api.listPasskeys.mockResolvedValue(mockPasskeys);

      const result = await listPasskeysAction();

      expect(result).toEqual(mockPasskeys);
    });

    it('should generate passkey registration options successfully', async () => {
      const { generatePasskeyRegistrationOptionsAction } = await import('../src/server-actions');

      const mockOptions = { challenge: 'challenge123' };
      mockAuth.api.generatePasskeyRegistrationOptions.mockResolvedValue(mockOptions);

      const result = await generatePasskeyRegistrationOptionsAction();

      expect(result).toEqual(mockOptions);
    });

    it('should delete passkey successfully', async () => {
      const { deletePasskeyAction } = await import('../src/server-actions');

      mockAuth.api.deletePasskey.mockResolvedValue({ success: true });

      const result = await deletePasskeyAction('pk-123');

      expect(mockAuth.api.deletePasskey).toHaveBeenCalledWith({
        body: { passkeyId: 'pk-123' },
        headers: expect.any(Headers),
      });
    });
  });

  describe('admin actions', () => {
    it('should ban user successfully', async () => {
      const { banUserAction } = await import('../src/server-actions');

      mockAuth.api.admin.banUser.mockResolvedValue({ success: true });

      const result = await banUserAction('user-123');

      expect(mockAuth.api.admin.banUser).toHaveBeenCalledWith({
        body: { userId: 'user-123' },
        headers: expect.any(Headers),
      });
    });

    it('should unban user successfully', async () => {
      const { unbanUserAction } = await import('../src/server-actions');

      mockAuth.api.admin.unbanUser.mockResolvedValue({ success: true });

      const result = await unbanUserAction('user-123');

      expect(mockAuth.api.admin.unbanUser).toHaveBeenCalledWith({
        body: { userId: 'user-123' },
        headers: expect.any(Headers),
      });
    });

    it('should list users successfully', async () => {
      const { listUsersAction } = await import('../src/server-actions');

      const mockUsers = [
        { id: 'user-1', email: 'user1@example.com', name: 'User 1' },
        { id: 'user-2', email: 'user2@example.com', name: 'User 2' },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await listUsersAction();

      expect(result).toEqual({ success: true, data: mockUsers });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          banned: true,
        },
      });
    });

    it('should list users with search query', async () => {
      const { listUsersAction } = await import('../src/server-actions');

      const mockUsers = [{ id: 'user-1', email: 'test@example.com' }];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await listUsersAction({
        search: 'test',
        limit: 50,
        offset: 10,
      });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'test', mode: 'insensitive' } },
            { name: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 10,
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should handle database error in list users', async () => {
      const { listUsersAction } = await import('../src/server-actions');

      mockPrisma.user.findMany.mockRejectedValue(new Error('Database error'));

      await expect(listUsersAction()).rejects.toThrow('Failed to list users: Database error');
    });

    it('should impersonate user successfully', async () => {
      const { impersonateUserAction } = await import('../src/server-actions');

      const mockResult = { sessionId: 'session-123' };
      mockAuth.api.admin.impersonateUser.mockResolvedValue(mockResult);

      const result = await impersonateUserAction('user-123');

      expect(mockAuth.api.admin.impersonateUser).toHaveBeenCalledWith({
        body: { userId: 'user-123' },
        headers: expect.any(Headers),
      });
    });

    it('should stop impersonating successfully', async () => {
      const { stopImpersonatingAction } = await import('../src/server-actions');

      mockAuth.api.admin.stopImpersonating.mockResolvedValue({ success: true });

      const result = await stopImpersonatingAction();

      expect(mockAuth.api.admin.stopImpersonating).toHaveBeenCalledWith({
        headers: expect.any(Headers),
      });
    });

    it('should bulk invite users successfully', async () => {
      const { bulkInviteUsersAction } = await import('../src/server-actions');

      mockAuth.api.sendInvitation
        .mockResolvedValueOnce({ id: 'inv-1' })
        .mockResolvedValueOnce({ id: 'inv-2' });

      const result = await bulkInviteUsersAction({
        emails: ['user1@example.com', 'user2@example.com'],
        role: 'member',
        organizationId: 'org-123',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        email: 'user1@example.com',
        success: true,
        result: { id: 'inv-1' },
      });
    });

    it('should handle error in bulk invite users', async () => {
      const { bulkInviteUsersAction } = await import('../src/server-actions');

      mockAuth.api.sendInvitation.mockRejectedValue(new Error('Invitation failed'));

      await expect(
        bulkInviteUsersAction({
          emails: ['user1@example.com'],
          role: 'member',
        }),
      ).rejects.toThrow('Failed to invite user user1@example.com: Error: Invitation failed');
    });

    it('should admin delete user successfully', async () => {
      const { adminDeleteUserAction } = await import('../src/server-actions');

      mockAuth.api.removeUser.mockResolvedValue({ success: true });

      const result = await adminDeleteUserAction('user-123');

      expect(mockAuth.api.removeUser).toHaveBeenCalledWith({
        body: { userId: 'user-123' },
        headers: expect.any(Headers),
      });
    });

    it('should create user successfully', async () => {
      const { createUserAction } = await import('../src/server-actions');

      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        role: 'member',
      };
      const mockUser = { id: 'user-123', ...userData };
      mockAuth.api.createUser.mockResolvedValue(mockUser);

      const result = await createUserAction(userData);

      expect(mockAuth.api.createUser).toHaveBeenCalledWith({
        body: {
          email: 'newuser@example.com',
          name: 'New User',
          password: 'password123',
          role: 'member',
        },
        headers: expect.any(Headers),
      });
    });

    it('should create user with defaults when optional fields missing', async () => {
      const { createUserAction } = await import('../src/server-actions');

      const userData = { email: 'test@example.com' };
      mockAuth.api.createUser.mockResolvedValue({ id: 'user-123' });

      // Mock crypto.randomUUID
      const mockRandomUUID = vi.fn().mockReturnValue('uuid-123-456-789');
      vi.stubGlobal('crypto', {
        ...global.crypto,
        randomUUID: mockRandomUUID,
      });

      const result = await createUserAction(userData);

      expect(mockAuth.api.createUser).toHaveBeenCalledWith({
        body: {
          email: 'test@example.com',
          name: 'test',
          password: 'uuid-123-456',
          role: undefined,
        },
        headers: expect.any(Headers),
      });

      vi.unstubAllGlobals();
    });

    it('should set user role successfully', async () => {
      const { setUserRoleAction } = await import('../src/server-actions');

      mockAuth.api.setRole.mockResolvedValue({ success: true });

      const result = await setUserRoleAction('user-123', 'admin');

      expect(mockAuth.api.setRole).toHaveBeenCalledWith({
        body: { userId: 'user-123', role: 'admin' },
        headers: expect.any(Headers),
      });
    });

    it('should revoke user sessions successfully', async () => {
      const { revokeUserSessionsAction } = await import('../src/server-actions');

      mockAuth.api.revokeUserSessions.mockResolvedValue({ success: true });

      const result = await revokeUserSessionsAction('user-123');

      expect(mockAuth.api.revokeUserSessions).toHaveBeenCalledWith({
        body: { userId: 'user-123' },
        headers: expect.any(Headers),
      });
    });
  });

  describe('admin organization management', () => {
    it('should list organizations successfully', async () => {
      const { listOrganizationsAction } = await import('../src/server-actions');

      const mockOrgs = [{ id: 'org-1' }, { id: 'org-2' }];
      mockAuth.api.listOrganizations.mockResolvedValue(mockOrgs);

      const result = await listOrganizationsAction();

      expect(mockAuth.api.listOrganizations).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        body: {
          limit: 100,
          offset: 0,
        },
      });
    });

    it('should list organizations with search options', async () => {
      const { listOrganizationsAction } = await import('../src/server-actions');

      const mockOrgs = [{ id: 'org-1' }];
      mockAuth.api.listOrganizations.mockResolvedValue(mockOrgs);

      const result = await listOrganizationsAction({
        limit: 50,
        offset: 10,
        search: 'test',
      });

      expect(mockAuth.api.listOrganizations).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        body: {
          limit: 50,
          offset: 10,
          search: 'test',
        },
      });
    });

    it('should get organization successfully', async () => {
      const { getOrganizationAction } = await import('../src/server-actions');

      const mockOrg = { id: 'org-123', name: 'Test Org' };
      mockAuth.api.getFullOrganization.mockResolvedValue(mockOrg);

      const result = await getOrganizationAction('org-123');

      expect(mockAuth.api.getFullOrganization).toHaveBeenCalledWith({
        headers: expect.any(Headers),
        query: { organizationId: 'org-123' },
      });
    });
  });
});
