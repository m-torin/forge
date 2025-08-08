/**
 * Tests for server-next.ts entry point
 */

import { describe, expect, vi } from 'vitest';

// Mock server-only to prevent client-side usage
vi.mock('server-only', () => ({}));

// Mock the dependencies
vi.mock('../src/shared/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('better-auth/next-js', () => ({
  toNextJsHandler: vi.fn(),
  nextCookies: vi.fn(),
}));

vi.mock('../src/server/session', () => ({
  getCurrentUser: vi.fn(),
  getSession: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock('../src/server-actions', () => ({
  adminDeleteUserAction: vi.fn(),
  banUserAction: vi.fn(),
  bulkCreateApiKeysAction: vi.fn(),
  bulkInviteUsersAction: vi.fn(),
  changePasswordAction: vi.fn(),
  createApiKeyAction: vi.fn(),
  createOrganizationAction: vi.fn(),
  createUserAction: vi.fn(),
  deleteApiKeyAction: vi.fn(),
  deleteOrganizationAction: vi.fn(),
  deletePasskeyAction: vi.fn(),
  deleteSessionAction: vi.fn(),
  deleteUserAction: vi.fn(),
  disableTwoFactorAction: vi.fn(),
  enableTwoFactorAction: vi.fn(),
  generatePasskeyRegistrationOptionsAction: vi.fn(),
  getActiveOrganizationAction: vi.fn(),
  getApiKeyAction: vi.fn(),
  getApiKeyStatisticsAction: vi.fn(),
  getCurrentUserAction: vi.fn(),
  getOrganizationAction: vi.fn(),
  getOrganizationByIdAction: vi.fn(),
  getSessionAction: vi.fn(),
  getTwoFactorBackupCodesAction: vi.fn(),
  getTwoFactorStatusAction: vi.fn(),
  impersonateUserAction: vi.fn(),
  listAccountsAction: vi.fn(),
  listApiKeysAction: vi.fn(),
  listOrganizationInvitationsAction: vi.fn(),
  listOrganizationsAction: vi.fn(),
  listPasskeysAction: vi.fn(),
  listSessionsAction: vi.fn(),
  listUserOrganizationsAction: vi.fn(),
  listUsersAction: vi.fn(),
  revokeUserSessionsAction: vi.fn(),
  setActiveOrganizationAction: vi.fn(),
  setPasswordAction: vi.fn(),
  setUserRoleAction: vi.fn(),
  stopImpersonatingAction: vi.fn(),
  unbanUserAction: vi.fn(),
  unlinkAccountAction: vi.fn(),
  updateApiKeyAction: vi.fn(),
  updateOrganizationAction: vi.fn(),
  updateUserAction: vi.fn(),
}));

describe('server-next.ts entry point', () => {
  test('should export core auth instance', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.auth).toBeDefined();
  });

  test('should export Next.js handler', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.toNextJsHandler).toBeDefined();
  });

  test('should export session utilities', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.getCurrentUser).toBeDefined();
    expect(serverNextModule.getSession).toBeDefined();
    expect(serverNextModule.requireAuth).toBeDefined();
  });

  test('should export user management actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.createUserAction).toBeDefined();
    expect(serverNextModule.updateUserAction).toBeDefined();
    expect(serverNextModule.deleteUserAction).toBeDefined();
    expect(serverNextModule.getCurrentUserAction).toBeDefined();
    expect(serverNextModule.listUsersAction).toBeDefined();
  });

  test('should export admin actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.adminDeleteUserAction).toBeDefined();
    expect(serverNextModule.banUserAction).toBeDefined();
    expect(serverNextModule.unbanUserAction).toBeDefined();
    expect(serverNextModule.impersonateUserAction).toBeDefined();
    expect(serverNextModule.stopImpersonatingAction).toBeDefined();
  });

  test('should export organization actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.createOrganizationAction).toBeDefined();
    expect(serverNextModule.updateOrganizationAction).toBeDefined();
    expect(serverNextModule.deleteOrganizationAction).toBeDefined();
    expect(serverNextModule.getOrganizationAction).toBeDefined();
    expect(serverNextModule.getOrganizationByIdAction).toBeDefined();
    expect(serverNextModule.listOrganizationsAction).toBeDefined();
    expect(serverNextModule.getActiveOrganizationAction).toBeDefined();
    expect(serverNextModule.setActiveOrganizationAction).toBeDefined();
  });

  test('should export API key actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.createApiKeyAction).toBeDefined();
    expect(serverNextModule.updateApiKeyAction).toBeDefined();
    expect(serverNextModule.deleteApiKeyAction).toBeDefined();
    expect(serverNextModule.getApiKeyAction).toBeDefined();
    expect(serverNextModule.listApiKeysAction).toBeDefined();
    expect(serverNextModule.getApiKeyStatisticsAction).toBeDefined();
    expect(serverNextModule.bulkCreateApiKeysAction).toBeDefined();
  });

  test('should export session management actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.getSessionAction).toBeDefined();
    expect(serverNextModule.deleteSessionAction).toBeDefined();
    expect(serverNextModule.listSessionsAction).toBeDefined();
    expect(serverNextModule.revokeUserSessionsAction).toBeDefined();
  });

  test('should export two-factor authentication actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.enableTwoFactorAction).toBeDefined();
    expect(serverNextModule.disableTwoFactorAction).toBeDefined();
    expect(serverNextModule.getTwoFactorStatusAction).toBeDefined();
    expect(serverNextModule.getTwoFactorBackupCodesAction).toBeDefined();
  });

  test('should export passkey actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.generatePasskeyRegistrationOptionsAction).toBeDefined();
    expect(serverNextModule.deletePasskeyAction).toBeDefined();
    expect(serverNextModule.listPasskeysAction).toBeDefined();
  });

  test('should export password management actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.changePasswordAction).toBeDefined();
    expect(serverNextModule.setPasswordAction).toBeDefined();
  });

  test('should export account management actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.listAccountsAction).toBeDefined();
    expect(serverNextModule.unlinkAccountAction).toBeDefined();
    expect(serverNextModule.setUserRoleAction).toBeDefined();
  });

  test('should export organization-specific actions', async () => {
    const serverNextModule = await import('../../src/server-next');

    expect(serverNextModule.listUserOrganizationsAction).toBeDefined();
    expect(serverNextModule.listOrganizationInvitationsAction).toBeDefined();
    expect(serverNextModule.bulkInviteUsersAction).toBeDefined();
  });
});
