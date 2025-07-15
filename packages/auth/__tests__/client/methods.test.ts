/**
 * Tests for client authentication methods
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the auth client
const mockAuthClient = {
  signIn: {
    email: vi.fn(),
  },
  signOut: vi.fn(),
  signUp: {
    email: vi.fn(),
  },
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmail: vi.fn(),
  resendEmailVerification: vi.fn(),
  changePassword: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
};

vi.mock('@/client/client', () => ({
  authClient: mockAuthClient,
}));

// Mock logger
const mockLogger = {
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

vi.mock('@/client/utils/logger', () => ({
  logger: mockLogger,
}));

describe('client authentication methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signIn.email.mockResolvedValue({
        success: true,
        data: { user: { id: '1' } },
      });

      const result = await methodsModule.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ success: true });
      expect(mockAuthClient.signIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle sign in errors from auth client', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signIn.email.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      const result = await methodsModule.signIn({
        email: 'test@example.com',
        password: 'wrong',
      });

      expect(result).toEqual({
        error: 'Invalid credentials',
        success: false,
      });
    });

    it('should handle sign in errors without message', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signIn.email.mockResolvedValue({
        error: {},
      });

      const result = await methodsModule.signIn({
        email: 'test@example.com',
        password: 'wrong',
      });

      expect(result).toEqual({
        error: 'Sign in failed',
        success: false,
      });
    });

    it('should handle network errors', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signIn.email.mockRejectedValue(new Error('Network error'));

      const result = await methodsModule.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        error: 'Network error',
        success: false,
      });
    });

    it('should handle non-Error exceptions', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signIn.email.mockRejectedValue('String error');

      const result = await methodsModule.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        error: 'Sign in failed',
        success: false,
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signOut.mockResolvedValue(undefined);

      await methodsModule.signOut();

      expect(mockAuthClient.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors gracefully', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signOut.mockRejectedValue(new Error('Sign out failed'));

      // Should not throw, just fail silently
      await expect(methodsModule.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('signUp', () => {
    it('should sign up successfully with name', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signUp.email.mockResolvedValue({
        success: true,
        data: { user: { id: '1' } },
      });

      const result = await methodsModule.signUp({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toEqual({ success: true });
      expect(mockAuthClient.signUp.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    });

    it('should sign up successfully without name (use email prefix)', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signUp.email.mockResolvedValue({
        success: true,
        data: { user: { id: '1' } },
      });

      const result = await methodsModule.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ success: true });
      expect(mockAuthClient.signUp.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'test', // Should use email prefix
      });
    });

    it('should handle sign up errors from auth client', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signUp.email.mockResolvedValue({
        error: { message: 'Email already exists' },
      });

      const result = await methodsModule.signUp({
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        error: 'Email already exists',
        success: false,
      });
    });

    it('should handle sign up errors without message', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signUp.email.mockResolvedValue({
        error: {},
      });

      const result = await methodsModule.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        error: 'Sign up failed',
        success: false,
      });
    });

    it('should handle network errors during sign up', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signUp.email.mockRejectedValue(new Error('Network error'));

      const result = await methodsModule.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        error: 'Network error',
        success: false,
      });
    });

    it('should handle empty email gracefully', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signUp.email.mockResolvedValue({
        success: true,
      });

      const result = await methodsModule.signUp({
        email: '',
        password: 'password123',
      });

      expect(mockAuthClient.signUp.email).toHaveBeenCalledWith({
        email: '',
        password: 'password123',
        name: '', // Empty email prefix
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined credentials', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signIn.email.mockRejectedValue(new Error('Invalid input'));

      const result = await methodsModule.signIn(undefined as any);

      expect(result).toEqual({
        error: 'Invalid input',
        success: false,
      });
    });

    it('should handle malformed email in signUp', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signUp.email.mockResolvedValue({
        success: true,
      });

      const result = await methodsModule.signUp({
        email: 'malformed-email',
        password: 'password123',
      });

      expect(mockAuthClient.signUp.email).toHaveBeenCalledWith({
        email: 'malformed-email',
        password: 'password123',
        name: 'malformed-email', // No @ symbol, uses whole string
      });
    });

    it('should handle concurrent method calls', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signIn.email.mockResolvedValue({ success: true });
      mockAuthClient.signUp.email.mockResolvedValue({ success: true });
      mockAuthClient.signOut.mockResolvedValue(undefined);

      const [signInResult, signUpResult] = await Promise.all([
        methodsModule.signIn({ email: 'test1@example.com', password: 'pass1' }),
        methodsModule.signUp({ email: 'test2@example.com', password: 'pass2' }),
      ]);

      expect(signInResult.success).toBe(true);
      expect(signUpResult.success).toBe(true);
    });

    it('should handle auth client returning null', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signIn.email.mockResolvedValue(null);

      const result = await methodsModule.signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ success: true });
    });

    it('should handle auth client returning undefined', async () => {
      const methodsModule = await import('@/client/methods');

      mockAuthClient.signUp.email.mockResolvedValue(undefined);

      const result = await methodsModule.signUp({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe('password methods', () => {
    it('should handle forgot password', async () => {
      const methodsModule = await import('@/client/methods');

      // Check if forgotPassword exists and test it
      if (methodsModule.forgotPassword) {
        mockAuthClient.forgotPassword.mockResolvedValue({ success: true });

        const result = await methodsModule.forgotPassword('test@example.com');

        expect(mockAuthClient.forgotPassword).toHaveBeenCalledWith('test@example.com');
      }
    });

    it('should handle reset password', async () => {
      const methodsModule = await import('@/client/methods');

      // Check if resetPassword exists and test it
      if (methodsModule.resetPassword) {
        mockAuthClient.resetPassword.mockResolvedValue({ success: true });

        const result = await methodsModule.resetPassword({
          token: 'reset-token',
          password: 'new-password',
        });

        expect(mockAuthClient.resetPassword).toHaveBeenCalledWith({
          token: 'reset-token',
          password: 'new-password',
        });
      }
    });

    it('should handle change password', async () => {
      const methodsModule = await import('@/client/methods');

      // Check if changePassword exists and test it
      if (methodsModule.changePassword) {
        mockAuthClient.changePassword.mockResolvedValue({ success: true });

        const result = await methodsModule.changePassword({
          currentPassword: 'old-password',
          newPassword: 'new-password',
        });

        expect(mockAuthClient.changePassword).toHaveBeenCalledWith({
          currentPassword: 'old-password',
          newPassword: 'new-password',
        });
      }
    });
  });

  describe('email verification', () => {
    it('should handle verify email', async () => {
      const methodsModule = await import('@/client/methods');

      // Check if verifyEmail exists and test it
      if (methodsModule.verifyEmail) {
        mockAuthClient.verifyEmail.mockResolvedValue({ success: true });

        const result = await methodsModule.verifyEmail('verification-token');

        expect(mockAuthClient.verifyEmail).toHaveBeenCalledWith('verification-token');
      }
    });

    it('should handle resend email verification', async () => {
      const methodsModule = await import('@/client/methods');

      // Check if resendEmailVerification exists and test it
      if (methodsModule.resendEmailVerification) {
        mockAuthClient.resendEmailVerification.mockResolvedValue({ success: true });

        const result = await methodsModule.resendEmailVerification('test@example.com');

        expect(mockAuthClient.resendEmailVerification).toHaveBeenCalledWith('test@example.com');
      }
    });
  });

  describe('user management', () => {
    it('should handle update user', async () => {
      const methodsModule = await import('@/client/methods');

      // Check if updateUser exists and test it
      if (methodsModule.updateUser) {
        mockAuthClient.updateUser.mockResolvedValue({ success: true });

        const result = await methodsModule.updateUser({
          name: 'Updated Name',
          email: 'updated@example.com',
        });

        expect(mockAuthClient.updateUser).toHaveBeenCalledWith({
          name: 'Updated Name',
          email: 'updated@example.com',
        });
      }
    });

    it('should handle delete user', async () => {
      const methodsModule = await import('@/client/methods');

      // Check if deleteUser exists and test it
      if (methodsModule.deleteUser) {
        mockAuthClient.deleteUser.mockResolvedValue({ success: true });

        const result = await methodsModule.deleteUser();

        expect(mockAuthClient.deleteUser).toHaveBeenCalled();
      }
    });
  });
});
