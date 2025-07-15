/**
 * Tests for Better Auth configuration
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
const mockLogError = vi.fn();
const mockLogInfo = vi.fn();
const mockSendPasswordResetEmail = vi.fn();
const mockSendVerificationEmail = vi.fn();
const mockSendMagicLinkEmail = vi.fn();
const mockSendOTPEmail = vi.fn();
const mockPrisma = {};

vi.mock('@repo/observability/shared-env', () => ({
  logError: mockLogError,
  logInfo: mockLogInfo,
}));

vi.mock('@repo/database/prisma/server/next', () => ({
  prisma: mockPrisma,
}));

vi.mock('@repo/email/server/next', () => ({
  sendMagicLinkEmail: mockSendMagicLinkEmail,
  sendOTPEmail: mockSendOTPEmail,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
  sendVerificationEmail: mockSendVerificationEmail,
}));

vi.mock('../../env', () => ({
  safeServerEnv: () => ({
    BETTER_AUTH_URL: 'https://example.com',
    BETTER_AUTH_SECRET: 'test-secret',
    NEXT_PUBLIC_APP_NAME: 'Test App',
    TRUSTED_ORIGINS: 'https://example.com,https://app.example.com',
    GITHUB_CLIENT_ID: 'github-id',
    GITHUB_CLIENT_SECRET: 'github-secret',
    GOOGLE_CLIENT_ID: 'google-id',
    GOOGLE_CLIENT_SECRET: 'google-secret',
    FACEBOOK_CLIENT_ID: 'facebook-id',
    FACEBOOK_CLIENT_SECRET: 'facebook-secret',
    DISCORD_CLIENT_ID: 'discord-id',
    DISCORD_CLIENT_SECRET: 'discord-secret',
    MICROSOFT_CLIENT_ID: 'microsoft-id',
    MICROSOFT_CLIENT_SECRET: 'microsoft-secret',
  }),
}));

// Mock better-auth and plugins
const mockBetterAuth = vi.fn();
const mockPrismaAdapter = vi.fn();
const mockNextCookies = vi.fn();
const mockAdmin = vi.fn();
const mockApiKey = vi.fn();
const mockBearer = vi.fn();
const mockCustomSession = vi.fn();
const mockMagicLink = vi.fn();
const mockMultiSession = vi.fn();
const mockOneTap = vi.fn();
const mockOpenAPI = vi.fn();
const mockOrganization = vi.fn();
const mockTwoFactor = vi.fn();
const mockPasskey = vi.fn();

vi.mock('better-auth', () => ({
  betterAuth: mockBetterAuth,
}));

vi.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: mockPrismaAdapter,
}));

vi.mock('better-auth/next-js', () => ({
  nextCookies: mockNextCookies,
}));

vi.mock('better-auth/plugins', () => ({
  admin: mockAdmin,
  apiKey: mockApiKey,
  bearer: mockBearer,
  customSession: mockCustomSession,
  magicLink: mockMagicLink,
  multiSession: mockMultiSession,
  oneTap: mockOneTap,
  openAPI: mockOpenAPI,
  organization: mockOrganization,
  twoFactor: mockTwoFactor,
}));

vi.mock('better-auth/plugins/passkey', () => ({
  passkey: mockPasskey,
}));

describe('auth configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mocks
    mockBetterAuth.mockReturnValue({
      api: {
        getSession: vi.fn(),
      },
    });
    mockPrismaAdapter.mockReturnValue({});
    mockNextCookies.mockReturnValue({});
    mockAdmin.mockReturnValue({});
    mockApiKey.mockReturnValue({});
    mockBearer.mockReturnValue({});
    mockCustomSession.mockReturnValue({});
    mockMagicLink.mockReturnValue({});
    mockMultiSession.mockReturnValue({});
    mockOneTap.mockReturnValue({});
    mockOpenAPI.mockReturnValue({});
    mockOrganization.mockReturnValue({});
    mockTwoFactor.mockReturnValue({});
    mockPasskey.mockReturnValue({});

    // Reset process.env
    process.env.NODE_ENV = 'test';
  });

  it('should create better auth instance with correct configuration', async () => {
    await import('../../src/shared/auth');

    expect(mockBetterAuth).toHaveBeenCalledWith({
      appName: 'Test App',
      baseURL: 'https://example.com',
      basePath: '/api/auth',
      secret: 'test-secret',
      trustedOrigins: ['https://example.com', 'https://app.example.com'],
      database: {},
      emailAndPassword: expect.objectContaining({
        enabled: true,
        autoSignIn: true,
        requireEmailVerification: false,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        resetPasswordTokenExpiresIn: 3600,
      }),
      emailVerification: expect.objectContaining({
        sendOnSignUp: false,
        autoSignInAfterVerification: true,
        expiresIn: 86400,
      }),
      socialProviders: expect.objectContaining({
        github: {
          clientId: 'github-id',
          clientSecret: 'github-secret',
          enabled: true,
        },
        google: {
          clientId: 'google-id',
          clientSecret: 'google-secret',
          enabled: true,
        },
        facebook: {
          clientId: 'facebook-id',
          clientSecret: 'facebook-secret',
          enabled: true,
        },
        discord: {
          clientId: 'discord-id',
          clientSecret: 'discord-secret',
          enabled: true,
        },
        microsoft: {
          clientId: 'microsoft-id',
          clientSecret: 'microsoft-secret',
          enabled: true,
        },
      }),
      session: expect.objectContaining({
        expiresIn: 2592000, // 30 days
        updateAge: 86400, // 1 day
        cookieCache: {
          enabled: true,
          maxAge: 300, // 5 minutes
        },
        storeSessionInDatabase: false,
      }),
      user: expect.objectContaining({
        additionalFields: {
          bio: {
            type: 'string',
            required: false,
          },
          role: {
            type: 'string',
            required: false,
            defaultValue: 'user',
          },
        },
        changeEmail: {
          enabled: true,
        },
        deleteUser: {
          enabled: true,
        },
      }),
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ['github', 'google', 'email-password'],
          allowDifferentEmails: false,
        },
      },
      rateLimit: {
        enabled: false, // NODE_ENV is 'test'
        window: 10,
        max: 100,
        storage: 'memory',
      },
      advanced: {
        useSecureCookies: false, // NODE_ENV is 'test'
        disableCSRFCheck: false,
        cookiePrefix: 'forge-auth',
        defaultCookieAttributes: {
          httpOnly: true,
          secure: false, // NODE_ENV is 'test'
          sameSite: 'lax',
        },
        crossSubDomainCookies: {
          enabled: false,
        },
      },
      plugins: expect.any(Array),
      onAPIError: {
        throw: false,
        onError: expect.any(Function),
      },
      hooks: {
        before: expect.any(Function),
      },
    });
  });

  it('should configure plugins correctly', async () => {
    await import('../../src/shared/auth');

    expect(mockAdmin).toHaveBeenCalledWith({
      impersonationSessionDuration: 86400, // 24 hours
    });

    expect(mockApiKey).toHaveBeenCalled();

    expect(mockOrganization).toHaveBeenCalledWith({
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
      creatorRole: 'owner',
      memberRole: 'member',
      invitationExpiresIn: 604800, // 7 days
    });

    expect(mockMagicLink).toHaveBeenCalledWith({
      sendMagicLink: expect.any(Function),
      expiresIn: 300, // 5 minutes
      disableSignUp: false,
    });

    expect(mockTwoFactor).toHaveBeenCalledWith({
      issuer: 'Test App',
      otpOptions: {
        sendOTP: expect.any(Function),
      },
    });

    expect(mockPasskey).toHaveBeenCalled();
    expect(mockMultiSession).toHaveBeenCalledWith({
      maximumSessions: 5,
    });
    expect(mockBearer).toHaveBeenCalled();
    expect(mockOneTap).toHaveBeenCalled();
    expect(mockCustomSession).toHaveBeenCalledWith(expect.any(Function));
    expect(mockOpenAPI).toHaveBeenCalled();
    expect(mockNextCookies).toHaveBeenCalled();
  });

  it('should handle production environment correctly', async () => {
    process.env.NODE_ENV = 'production';

    // Re-import to trigger reconfiguration
    vi.resetModules();
    await import('../../src/shared/auth');

    const configCall = mockBetterAuth.mock.calls[0][0];
    expect(configCall.rateLimit.enabled).toBe(true);
    expect(configCall.advanced.useSecureCookies).toBe(true);
    expect(configCall.advanced.defaultCookieAttributes.secure).toBe(true);
  });

  describe('email handlers', () => {
    it('should handle sendPasswordResetEmail successfully', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const sendResetPassword = configCall.emailAndPassword.sendResetPassword;

      const user = { email: 'test@example.com', name: 'Test User' };
      const url = 'https://example.com/reset?token=123';

      await sendResetPassword({ user, url });

      expect(mockLogInfo).toHaveBeenCalledWith('Sending password reset email to test@example.com');
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        resetLink: url,
      });
      expect(mockLogInfo).toHaveBeenCalledWith(
        'Password reset email sent successfully to test@example.com',
      );
    });

    it('should handle sendPasswordResetEmail errors', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const sendResetPassword = configCall.emailAndPassword.sendResetPassword;

      const error = new Error('Email service error');
      mockSendPasswordResetEmail.mockRejectedValue(error);

      const user = { email: 'test@example.com', name: 'Test User' };
      const url = 'https://example.com/reset?token=123';

      await expect(sendResetPassword({ user, url })).rejects.toThrow('Email service error');

      expect(mockLogError).toHaveBeenCalledWith('Failed to send password reset email', error, {
        email: 'test@example.com',
      });
    });

    it('should handle sendVerificationEmail successfully', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const sendVerificationEmail = configCall.emailVerification.sendVerificationEmail;

      const user = { email: 'test@example.com', name: 'Test User' };
      const url = 'https://example.com/verify?token=123';

      await sendVerificationEmail({ user, url });

      expect(mockLogInfo).toHaveBeenCalledWith('Sending verification email to test@example.com');
      expect(mockSendVerificationEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        verificationLink: url,
      });
      expect(mockLogInfo).toHaveBeenCalledWith(
        'Verification email sent successfully to test@example.com',
      );
    });

    it('should handle sendVerificationEmail errors', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const sendVerificationEmail = configCall.emailVerification.sendVerificationEmail;

      const error = new Error('Verification email error');
      mockSendVerificationEmail.mockRejectedValue(error);

      const user = { email: 'test@example.com', name: 'Test User' };
      const url = 'https://example.com/verify?token=123';

      await expect(sendVerificationEmail({ user, url })).rejects.toThrow(
        'Verification email error',
      );

      expect(mockLogError).toHaveBeenCalledWith('Failed to send verification email', error, {
        email: 'test@example.com',
      });
    });

    it('should handle sendChangeEmailVerification successfully', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const sendChangeEmailVerification = configCall.user.changeEmail.sendChangeEmailVerification;

      const user = { email: 'old@example.com', name: 'Test User' };
      const newEmail = 'new@example.com';
      const url = 'https://example.com/verify-change?token=123';

      await sendChangeEmailVerification({ user, newEmail, url });

      expect(mockLogInfo).toHaveBeenCalledWith(
        'Sending change email verification to new@example.com',
      );
      expect(mockSendVerificationEmail).toHaveBeenCalledWith({
        email: newEmail,
        name: 'Test User',
        verificationLink: url,
      });
      expect(mockLogInfo).toHaveBeenCalledWith(
        'Change email verification sent successfully to new@example.com',
      );
    });

    it('should handle sendChangeEmailVerification errors', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const sendChangeEmailVerification = configCall.user.changeEmail.sendChangeEmailVerification;

      const error = new Error('Change email error');
      mockSendVerificationEmail.mockRejectedValue(error);

      const user = { email: 'old@example.com', name: 'Test User' };
      const newEmail = 'new@example.com';
      const url = 'https://example.com/verify-change?token=123';

      await expect(sendChangeEmailVerification({ user, newEmail, url })).rejects.toThrow(
        'Change email error',
      );

      expect(mockLogError).toHaveBeenCalledWith('Failed to send change email verification', error, {
        oldEmail: 'old@example.com',
        newEmail: 'new@example.com',
      });
    });

    it('should handle sendDeleteAccountVerification successfully', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const sendDeleteAccountVerification =
        configCall.user.deleteUser.sendDeleteAccountVerification;

      const user = { email: 'test@example.com', name: 'Test User' };
      const url = 'https://example.com/delete?token=123';

      await sendDeleteAccountVerification({ user, url });

      expect(mockLogInfo).toHaveBeenCalledWith(
        'Sending delete account verification to test@example.com',
      );
      expect(mockSendVerificationEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        verificationLink: url,
      });
      expect(mockLogInfo).toHaveBeenCalledWith(
        'Delete account verification sent successfully to test@example.com',
      );
    });

    it('should handle beforeDelete hook', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const beforeDelete = configCall.user.deleteUser.beforeDelete;

      const user = { email: 'test@example.com', name: 'Test User' };

      await beforeDelete(user);

      expect(mockLogInfo).toHaveBeenCalledWith('Preparing to delete user: test@example.com');
    });

    it('should handle afterDelete hook', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const afterDelete = configCall.user.deleteUser.afterDelete;

      const user = { email: 'test@example.com', name: 'Test User' };

      await afterDelete(user);

      expect(mockLogInfo).toHaveBeenCalledWith('User deleted: test@example.com');
    });
  });

  describe('magic link handler', () => {
    it('should send magic link successfully with provided URL', async () => {
      await import('../../src/shared/auth');

      const magicLinkConfig = mockMagicLink.mock.calls[0][0];
      const sendMagicLink = magicLinkConfig.sendMagicLink;

      const email = 'test@example.com';
      const token = 'magic-token-123';
      const url = 'https://example.com/magic-link?token=magic-token-123';

      await sendMagicLink({ email, token, url }, {});

      expect(mockLogInfo).toHaveBeenCalledWith('Sending magic link to test@example.com');
      expect(mockSendMagicLinkEmail).toHaveBeenCalledWith({
        email,
        magicLink: url,
        name: 'test',
        expiresIn: '5 minutes',
      });
      expect(mockLogInfo).toHaveBeenCalledWith('Magic link sent successfully to test@example.com');
    });

    it('should send magic link successfully without provided URL', async () => {
      await import('../../src/shared/auth');

      const magicLinkConfig = mockMagicLink.mock.calls[0][0];
      const sendMagicLink = magicLinkConfig.sendMagicLink;

      const email = 'test@example.com';
      const token = 'magic-token-123';

      await sendMagicLink({ email, token }, {});

      expect(mockSendMagicLinkEmail).toHaveBeenCalledWith({
        email,
        magicLink: 'https://example.com/auth/magic-link/verify?token=magic-token-123',
        name: 'test',
        expiresIn: '5 minutes',
      });
    });

    it('should handle magic link send errors', async () => {
      await import('../../src/shared/auth');

      const magicLinkConfig = mockMagicLink.mock.calls[0][0];
      const sendMagicLink = magicLinkConfig.sendMagicLink;

      const error = new Error('Magic link error');
      mockSendMagicLinkEmail.mockRejectedValue(error);

      const email = 'test@example.com';
      const token = 'magic-token-123';

      await expect(sendMagicLink({ email, token }, {})).rejects.toThrow('Magic link error');

      expect(mockLogError).toHaveBeenCalledWith('Failed to send magic link email', error, {
        email,
      });
    });
  });

  describe('two factor OTP handler', () => {
    it('should send OTP successfully', async () => {
      await import('../../src/shared/auth');

      const twoFactorConfig = mockTwoFactor.mock.calls[0][0];
      const sendOTP = twoFactorConfig.otpOptions.sendOTP;

      const user = { email: 'test@example.com', name: 'Test User' };
      const otp = '123456';

      await sendOTP({ user, otp }, {});

      expect(mockLogInfo).toHaveBeenCalledWith('Sending OTP to test@example.com');
      expect(mockSendOTPEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        otp,
        purpose: 'two-factor authentication',
      });
      expect(mockLogInfo).toHaveBeenCalledWith('OTP sent successfully to test@example.com');
    });

    it('should send OTP with fallback name', async () => {
      await import('../../src/shared/auth');

      const twoFactorConfig = mockTwoFactor.mock.calls[0][0];
      const sendOTP = twoFactorConfig.otpOptions.sendOTP;

      const user = { email: 'test@example.com' }; // No name
      const otp = '123456';

      await sendOTP({ user, otp }, {});

      expect(mockSendOTPEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'test', // Fallback to email prefix
        otp,
        purpose: 'two-factor authentication',
      });
    });

    it('should handle OTP send errors', async () => {
      await import('../../src/shared/auth');

      const twoFactorConfig = mockTwoFactor.mock.calls[0][0];
      const sendOTP = twoFactorConfig.otpOptions.sendOTP;

      const error = new Error('OTP send error');
      mockSendOTPEmail.mockRejectedValue(error);

      const user = { email: 'test@example.com', name: 'Test User' };
      const otp = '123456';

      await expect(sendOTP({ user, otp }, {})).rejects.toThrow('OTP send error');

      expect(mockLogError).toHaveBeenCalledWith('Failed to send OTP email', error, {
        email: 'test@example.com',
      });
    });
  });

  describe('custom session handler', () => {
    it('should enhance session object', async () => {
      await import('../../src/shared/auth');

      const customSessionHandler = mockCustomSession.mock.calls[0][0];

      const inputSession = {
        id: 'session-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };

      const enhancedSession = await customSessionHandler(inputSession);

      expect(enhancedSession).toEqual({
        ...inputSession,
        user: {
          ...inputSession.user,
        },
      });
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const onError = configCall.onAPIError.onError;

      const error = new Error('API Error');
      const ctx = { path: '/auth/signin', method: 'POST' };

      await onError(error, ctx);

      expect(mockLogError).toHaveBeenCalledWith('Better Auth API Error', error, {
        path: '/auth/signin',
        method: 'POST',
      });
    });

    it('should handle non-Error objects', async () => {
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const onError = configCall.onAPIError.onError;

      const errorString = 'String error';
      const ctx = { path: '/auth/signup', method: 'POST' };

      await onError(errorString, ctx);

      expect(mockLogError).toHaveBeenCalledWith(
        'Better Auth API Error',
        new Error('String error'),
        { path: '/auth/signup', method: 'POST' },
      );
    });
  });

  describe('request hooks', () => {
    it('should log requests in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      vi.resetModules();
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const beforeHook = configCall.hooks.before;

      const ctx = { method: 'POST', path: '/auth/signin' };

      await beforeHook(ctx);

      expect(mockLogInfo).toHaveBeenCalledWith('Auth Request: POST /auth/signin');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log requests in non-development mode', async () => {
      process.env.NODE_ENV = 'production';

      vi.resetModules();
      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      const beforeHook = configCall.hooks.before;

      const ctx = { method: 'POST', path: '/auth/signin' };

      await beforeHook(ctx);

      expect(mockLogInfo).not.toHaveBeenCalledWith('Auth Request: POST /auth/signin');
    });
  });

  describe('environment edge cases', () => {
    it('should handle missing optional environment variables', async () => {
      vi.resetModules();

      vi.doMock('../../env', () => ({
        safeServerEnv: () => ({
          BETTER_AUTH_SECRET: 'test-secret',
          // Missing all other optional variables
        }),
      }));

      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];

      expect(configCall.baseURL).toBe('http://localhost:3000');
      expect(configCall.appName).toBe('Forge');
      expect(configCall.trustedOrigins).toEqual([
        'http://localhost:3000',
        'http://localhost:3302',
        'http://localhost:3400',
      ]);
      expect(configCall.socialProviders).toEqual({});
    });

    it('should throw error when BETTER_AUTH_SECRET is missing', async () => {
      vi.resetModules();

      vi.doMock('../../env', () => ({
        safeServerEnv: () => ({}),
      }));

      expect(() => import('../../src/shared/auth')).rejects.toThrow(
        'BETTER_AUTH_SECRET is required. Please set it in your environment variables.',
      );
    });

    it('should use AUTH_SECRET as fallback', async () => {
      vi.resetModules();

      vi.doMock('../../env', () => ({
        safeServerEnv: () => ({
          AUTH_SECRET: 'fallback-secret',
        }),
      }));

      await import('../../src/shared/auth');

      const configCall = mockBetterAuth.mock.calls[0][0];
      expect(configCall.secret).toBe('fallback-secret');
    });
  });
});
