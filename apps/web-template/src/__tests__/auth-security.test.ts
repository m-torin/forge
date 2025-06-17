import { describe, it, expect, vi, beforeEach } from 'vitest';
import { changePassword, getLinkedAccounts, linkAccount, unlinkAccount } from '../actions/auth';

// Mock Better Auth functions
vi.mock('@repo/auth/server/next', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 'test-user-id' } })),
  changePassword: vi.fn(() =>
    Promise.resolve({ success: true, data: { message: 'Password changed' } }),
  ),
  listAccounts: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: [
        { provider: 'google', providerAccountId: '123', createdAt: new Date() },
        { provider: 'github', providerAccountId: '456', createdAt: new Date() },
      ],
    }),
  ),
  unlinkAccount: vi.fn(() =>
    Promise.resolve({ success: true, data: { message: 'Account unlinked' } }),
  ),
}));

describe('Auth Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('changePassword', () => {
    it('should use Better Auth changePassword', async () => {
      const result = await changePassword({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
      });

      expect(result.success).toBe(true);
      expect((result.data as any)?.message).toBe('Password changed');
    });

    it('should not directly access the database', async () => {
      const changePasswordSource = changePassword.toString();
      expect(changePasswordSource).not.toContain('prisma');
      expect(changePasswordSource).not.toContain('db.');
    });
  });

  describe('getLinkedAccounts', () => {
    it('should use Better Auth to get linked accounts', async () => {
      const accounts = await getLinkedAccounts();

      expect(Array.isArray((accounts as any).data)).toBe(true);
      expect((accounts as any).data).toHaveLength(2);
      expect((accounts as any).data[0].provider).toBe('google');
      expect((accounts as any).data[1].provider).toBe('github');
    });

    it('should not directly query the database', async () => {
      const getLinkedAccountsSource = getLinkedAccounts.toString();
      expect(getLinkedAccountsSource).not.toContain('prisma');
      expect(getLinkedAccountsSource).not.toContain('findMany');
    });
  });

  describe('unlinkAccount', () => {
    it('should use Better Auth to unlink accounts', async () => {
      const result = await unlinkAccount('account-id', 'google');

      expect(result.success).toBe(true);
      expect((result.data as any)?.message).toBe('Account unlinked');
    });

    it('should not directly delete from database', async () => {
      const unlinkAccountSource = unlinkAccount.toString();
      expect(unlinkAccountSource).not.toContain('prisma');
      expect(unlinkAccountSource).not.toContain('deleteMany');
    });
  });

  describe('Security Best Practices', () => {
    it('all auth functions should go through Better Auth', () => {
      const authFunctions = [changePassword, getLinkedAccounts, linkAccount, unlinkAccount];

      authFunctions.forEach((fn) => {
        const source = fn.toString();
        // Should use Better Auth imports
        expect(source).not.toContain('prisma');
        expect(source).not.toContain('bcrypt');
        expect(source).not.toContain('hash(');
        expect(source).not.toContain('compare(');
      });
    });
  });
});
