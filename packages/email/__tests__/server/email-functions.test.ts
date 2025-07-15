import { beforeEach, describe, expect, test, vi } from 'vitest';

// Create mocks first
const mockRender = vi.fn();
const mockResend = {
  emails: {
    send: vi.fn(),
  },
};
const MockResend = vi.fn(() => mockResend);
const mockSafeEnv = vi.fn();
const mockLogger = {
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
};

// Set global logger mock
(global as any).mockLogger = mockLogger;

// Mock @react-email/render
vi.mock('@react-email/render', () => ({
  render: mockRender,
}));

// Mock resend
vi.mock('resend', () => ({
  Resend: MockResend,
}));

// Mock templates
vi.mock('../../src/templates/magic-link', () => ({
  MagicLinkTemplate: vi
    .fn()
    .mockImplementation(props => `MagicLinkTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../../src/templates/verification', () => ({
  VerificationTemplate: vi
    .fn()
    .mockImplementation(props => `VerificationTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../../src/templates/password-reset', () => ({
  PasswordResetTemplate: vi
    .fn()
    .mockImplementation(props => `PasswordResetTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../../src/templates/contact', () => ({
  ContactTemplate: vi.fn().mockImplementation(props => `ContactTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../../src/templates/organization-invitation', () => ({
  OrganizationInvitationTemplate: vi
    .fn()
    .mockImplementation(props => `OrganizationInvitationTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../../src/templates/welcome', () => ({
  WelcomeTemplate: vi.fn().mockImplementation(props => `WelcomeTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../../src/templates/api-key-created', () => ({
  ApiKeyCreatedTemplate: vi
    .fn()
    .mockImplementation(props => `ApiKeyCreatedTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../../env', () => ({
  safeEnv: mockSafeEnv,
}));

describe('email Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Reset package state
    if ((global as any).emailPackageReset) {
      (global as any).emailPackageReset();
    }

    mockSafeEnv.mockReturnValue({
      RESEND_FROM: 'noreply@example.com',
      RESEND_TOKEN: 're_123456789',
    });

    mockRender.mockResolvedValue('<html>Mock rendered email</html>');
    mockResend.emails.send.mockResolvedValue({
      data: { id: 'email_123' },
      error: null,
    });
  });

  describe('sendMagicLinkEmail', () => {
    test('should send magic link email with all required data', async () => {
      // Import resend first to ensure proxy initialization
      const { sendMagicLinkEmail, resend } = await import('../../src/index');

      // Access emails to trigger proxy initialization

      const emails = resend.emails;

      const data = {
        name: 'John Doe',
        email: 'test@example.com',
        expiresIn: '30 minutes',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      const result = await sendMagicLinkEmail(data);

      expect(mockRender).toHaveBeenCalledWith(expect.stringContaining('MagicLinkTemplate'));

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'Your magic link to sign in',
        to: 'test@example.com',
      });

      expect(result).toStrictEqual({
        data: { id: 'email_123' },
        error: null,
      });
    });

    test('should use default expiresIn when not provided', async () => {
      const { sendMagicLinkEmail } = await import('../../src/index');
      const { MagicLinkTemplate } = await import('../../src/templates/magic-link');

      const data = {
        name: 'John Doe',
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      await sendMagicLinkEmail(data);

      expect(MagicLinkTemplate).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        expiresIn: '20 minutes',
        magicLink: 'https://example.com/magic-link?token=abc123',
      });
    });

    test('should use fallback sender when RESEND_FROM is not set', async () => {
      mockSafeEnv.mockReturnValue({
        RESEND_FROM: undefined,
        RESEND_TOKEN: 're_123456789',
      });

      const { sendMagicLinkEmail } = await import('../../src/index');

      const data = {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      await sendMagicLinkEmail(data);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'Your magic link to sign in',
        to: 'test@example.com',
      });
    });

    test('should handle render errors', async () => {
      const { sendMagicLinkEmail } = await import('../../src/index');

      mockRender.mockRejectedValue(new Error('Template render failed'));

      const data = {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      await expect(sendMagicLinkEmail(data)).rejects.toThrow('Failed to send magic link email');
    });

    test('should handle send errors', async () => {
      const { sendMagicLinkEmail } = await import('../../src/index');

      mockResend.emails.send.mockRejectedValue(new Error('Send failed'));

      const data = {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      await expect(sendMagicLinkEmail(data)).rejects.toThrow('Failed to send magic link email');
    });
  });

  describe('sendVerificationEmail', () => {
    test('should send verification email successfully', async () => {
      const { sendVerificationEmail } = await import('../../src/index');
      const { VerificationTemplate } = await import('../../src/templates/verification');

      const data = {
        name: 'Jane Doe',
        email: 'test@example.com',
        verificationLink: 'https://example.com/verify?token=abc123',
      };

      const result = await sendVerificationEmail(data);

      expect(VerificationTemplate).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'test@example.com',
        verificationLink: 'https://example.com/verify?token=abc123',
      });

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'Verify your email address',
        to: 'test@example.com',
      });

      expect(result).toStrictEqual({
        data: { id: 'email_123' },
        error: null,
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    test('should send password reset email successfully', async () => {
      const { sendPasswordResetEmail } = await import('../../src/index');
      const { PasswordResetTemplate } = await import('../../src/templates/password-reset');

      const data = {
        name: 'Bob Smith',
        email: 'test@example.com',
        resetLink: 'https://example.com/reset?token=abc123',
      };

      await sendPasswordResetEmail(data);

      expect(PasswordResetTemplate).toHaveBeenCalledWith({
        name: 'Bob Smith',
        email: 'test@example.com',
        resetLink: 'https://example.com/reset?token=abc123',
      });

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'Reset your password',
        to: 'test@example.com',
      });
    });

    test('should handle render errors', async () => {
      const { sendPasswordResetEmail } = await import('../../src/index');

      mockRender.mockRejectedValue(new Error('Template render failed'));

      const data = {
        name: 'Bob Smith',
        email: 'test@example.com',
        resetLink: 'https://example.com/reset?token=abc123',
      };

      await expect(sendPasswordResetEmail(data)).rejects.toThrow(
        'Failed to send password reset email',
      );
    });

    test('should handle send errors', async () => {
      const { sendPasswordResetEmail } = await import('../../src/index');

      mockResend.emails.send.mockRejectedValue(new Error('Send failed'));

      const data = {
        name: 'Bob Smith',
        email: 'test@example.com',
        resetLink: 'https://example.com/reset?token=abc123',
      };

      await expect(sendPasswordResetEmail(data)).rejects.toThrow(
        'Failed to send password reset email',
      );
    });
  });

  describe('sendOTPEmail', () => {
    test('should send OTP email successfully', async () => {
      const { sendOTPEmail } = await import('../../src/index');

      const data = {
        name: 'John Doe',
        email: 'test@example.com',
        otp: '123456',
        purpose: 'login verification',
      };

      const result = await sendOTPEmail(data);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: expect.stringContaining('123456'),
        subject: 'Your login verification code: 123456',
        to: 'test@example.com',
      });

      expect(result).toStrictEqual({
        data: { id: 'email_123' },
        error: null,
      });
    });

    test('should use default purpose when not provided', async () => {
      const { sendOTPEmail } = await import('../../src/index');

      const data = {
        email: 'test@example.com',
        otp: '654321',
      };

      await sendOTPEmail(data);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: expect.stringContaining('654321'),
        subject: 'Your authentication code: 654321',
        to: 'test@example.com',
      });
    });

    test('should handle null name', async () => {
      const { sendOTPEmail } = await import('../../src/index');

      const data = {
        name: null,
        email: 'test@example.com',
        otp: '789012',
        purpose: 'account verification',
      };

      await sendOTPEmail(data);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: expect.stringContaining('Hi,'),
        subject: 'Your account verification code: 789012',
        to: 'test@example.com',
      });
    });

    test('should handle send errors', async () => {
      const { sendOTPEmail } = await import('../../src/index');

      mockResend.emails.send.mockRejectedValue(new Error('Send failed'));

      const data = {
        email: 'test@example.com',
        otp: '123456',
      };

      await expect(sendOTPEmail(data)).rejects.toThrow('Failed to send OTP email');
    });

    test('should use fallback sender when RESEND_FROM is not set', async () => {
      mockSafeEnv.mockReturnValue({
        RESEND_FROM: undefined,
        RESEND_TOKEN: 're_123456789',
      });

      const { sendOTPEmail } = await import('../../src/index');

      const data = {
        email: 'test@example.com',
        otp: '123456',
      };

      await sendOTPEmail(data);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: expect.stringContaining('123456'),
        subject: 'Your authentication code: 123456',
        to: 'test@example.com',
      });
    });
  });

  describe('sendContactEmail', () => {
    test('should send contact email successfully', async () => {
      const { sendContactEmail } = await import('../../src/index');
      const { ContactTemplate } = await import('../../src/templates/contact');

      const data = {
        name: 'Customer Name',
        email: 'customer@example.com',
        message: 'I need help with my account',
        to: 'support@example.com',
      };

      await sendContactEmail(data);

      expect(ContactTemplate).toHaveBeenCalledWith({
        name: 'Customer Name',
        email: 'customer@example.com',
        message: 'I need help with my account',
      });

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'New contact form submission from Customer Name',
        to: 'support@example.com',
      });
    });

    test('should use default recipient when to is not provided', async () => {
      const { sendContactEmail } = await import('../../src/index');

      const data = {
        name: 'Customer Name',
        email: 'customer@example.com',
        message: 'I need help with my account',
      };

      await sendContactEmail(data);

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'New contact form submission from Customer Name',
        to: 'contact@example.com',
      });
    });

    test('should handle render errors', async () => {
      const { sendContactEmail } = await import('../../src/index');

      mockRender.mockRejectedValue(new Error('Template render failed'));

      const data = {
        name: 'Customer Name',
        email: 'customer@example.com',
        message: 'I need help with my account',
      };

      await expect(sendContactEmail(data)).rejects.toThrow('Failed to send contact email');
    });

    test('should handle send errors', async () => {
      const { sendContactEmail } = await import('../../src/index');

      mockResend.emails.send.mockRejectedValue(new Error('Send failed'));

      const data = {
        name: 'Customer Name',
        email: 'customer@example.com',
        message: 'I need help with my account',
      };

      await expect(sendContactEmail(data)).rejects.toThrow('Failed to send contact email');
    });
  });

  describe('sendOrganizationInvitationEmail', () => {
    test('should send organization invitation email successfully', async () => {
      const { sendOrganizationInvitationEmail } = await import('../../src/index');
      const { OrganizationInvitationTemplate } = await import(
        '../../src/templates/organization-invitation'
      );

      const data = {
        email: 'invite@example.com',
        expiresIn: '72 hours',
        inviteLink: 'https://example.com/invite?token=abc123',
        inviterEmail: 'admin@example.com',
        inviterName: 'John Admin',
        organizationName: 'Acme Corp',
      };

      await sendOrganizationInvitationEmail(data);

      expect(OrganizationInvitationTemplate).toHaveBeenCalledWith({
        email: 'invite@example.com',
        expiresIn: '72 hours',
        inviteLink: 'https://example.com/invite?token=abc123',
        inviterEmail: 'admin@example.com',
        inviterName: 'John Admin',
        organizationName: 'Acme Corp',
      });

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'Invitation to join Acme Corp',
        to: 'invite@example.com',
      });
    });

    test('should use default expiresIn when not provided', async () => {
      const { sendOrganizationInvitationEmail } = await import('../../src/index');
      const { OrganizationInvitationTemplate } = await import(
        '../../src/templates/organization-invitation'
      );

      const data = {
        email: 'invite@example.com',
        inviteLink: 'https://example.com/invite?token=abc123',
        inviterEmail: 'admin@example.com',
        organizationName: 'Acme Corp',
      };

      await sendOrganizationInvitationEmail(data);

      expect(OrganizationInvitationTemplate).toHaveBeenCalledWith({
        email: 'invite@example.com',
        expiresIn: '48 hours',
        inviteLink: 'https://example.com/invite?token=abc123',
        inviterEmail: 'admin@example.com',
        inviterName: undefined,
        organizationName: 'Acme Corp',
      });
    });

    test('should handle render errors', async () => {
      const { sendOrganizationInvitationEmail } = await import('../../src/index');

      mockRender.mockRejectedValue(new Error('Template render failed'));

      const data = {
        email: 'invite@example.com',
        inviteLink: 'https://example.com/invite?token=abc123',
        inviterEmail: 'admin@example.com',
        organizationName: 'Acme Corp',
      };

      await expect(sendOrganizationInvitationEmail(data)).rejects.toThrow(
        'Failed to send organization invitation email',
      );
    });

    test('should handle send errors', async () => {
      const { sendOrganizationInvitationEmail } = await import('../../src/index');

      mockResend.emails.send.mockRejectedValue(new Error('Send failed'));

      const data = {
        email: 'invite@example.com',
        inviteLink: 'https://example.com/invite?token=abc123',
        inviterEmail: 'admin@example.com',
        organizationName: 'Acme Corp',
      };

      await expect(sendOrganizationInvitationEmail(data)).rejects.toThrow(
        'Failed to send organization invitation email',
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    test('should send welcome email successfully', async () => {
      const { sendWelcomeEmail } = await import('../../src/index');
      const { WelcomeTemplate } = await import('../../src/templates/welcome');

      const data = {
        name: 'New User',
        dashboardUrl: 'https://app.example.com/dashboard',
        email: 'newuser@example.com',
        organizationName: 'Acme Corp',
      };

      await sendWelcomeEmail(data);

      expect(WelcomeTemplate).toHaveBeenCalledWith({
        name: 'New User',
        dashboardUrl: 'https://app.example.com/dashboard',
        email: 'newuser@example.com',
        organizationName: 'Acme Corp',
      });

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'Welcome to Acme Corp!',
        to: 'newuser@example.com',
      });
    });

    test('should handle render errors', async () => {
      const { sendWelcomeEmail } = await import('../../src/index');

      mockRender.mockRejectedValue(new Error('Template render failed'));

      const data = {
        name: 'New User',
        email: 'newuser@example.com',
        organizationName: 'Acme Corp',
      };

      await expect(sendWelcomeEmail(data)).rejects.toThrow('Failed to send welcome email');
    });

    test('should handle send errors', async () => {
      const { sendWelcomeEmail } = await import('../../src/index');

      mockResend.emails.send.mockRejectedValue(new Error('Send failed'));

      const data = {
        name: 'New User',
        email: 'newuser@example.com',
        organizationName: 'Acme Corp',
      };

      await expect(sendWelcomeEmail(data)).rejects.toThrow('Failed to send welcome email');
    });
  });

  describe('sendApiKeyCreatedEmail', () => {
    test('should send API key created email successfully', async () => {
      const { sendApiKeyCreatedEmail } = await import('../../src/index');
      const { ApiKeyCreatedTemplate } = await import('../../src/templates/api-key-created');

      const data = {
        name: 'User Name',
        apiKeyId: 'ak_123456789',
        apiKeyName: 'Production API Key',
        dashboardUrl: 'https://app.example.com/api-keys',
        email: 'user@example.com',
      };

      await sendApiKeyCreatedEmail(data);

      expect(ApiKeyCreatedTemplate).toHaveBeenCalledWith({
        name: 'User Name',
        apiKeyId: 'ak_123456789',
        apiKeyName: 'Production API Key',
        dashboardUrl: 'https://app.example.com/api-keys',
        email: 'user@example.com',
      });

      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'API Key "Production API Key" Created',
        to: 'user@example.com',
      });
    });

    test('should handle render errors', async () => {
      const { sendApiKeyCreatedEmail } = await import('../../src/index');

      mockRender.mockRejectedValue(new Error('Template render failed'));

      const data = {
        name: 'User Name',
        apiKeyId: 'ak_123456789',
        apiKeyName: 'Production API Key',
        email: 'user@example.com',
      };

      await expect(sendApiKeyCreatedEmail(data)).rejects.toThrow(
        'Failed to send API key created email',
      );
    });

    test('should handle send errors', async () => {
      const { sendApiKeyCreatedEmail } = await import('../../src/index');

      mockResend.emails.send.mockRejectedValue(new Error('Send failed'));

      const data = {
        name: 'User Name',
        apiKeyId: 'ak_123456789',
        apiKeyName: 'Production API Key',
        email: 'user@example.com',
      };

      await expect(sendApiKeyCreatedEmail(data)).rejects.toThrow(
        'Failed to send API key created email',
      );
    });
  });

  describe('error handling', () => {
    test('should handle and rethrow render errors', async () => {
      const { sendMagicLinkEmail } = await import('../../src/index');

      const renderError = new Error('Template compilation failed');
      mockRender.mockRejectedValue(renderError);

      const data = {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link',
      };

      await expect(sendMagicLinkEmail(data)).rejects.toThrow(
        'Failed to send magic link email: Template compilation failed',
      );
    });

    test('should handle and rethrow send errors', async () => {
      const { sendVerificationEmail } = await import('../../src/index');

      const sendError = new Error('API rate limit exceeded');
      mockResend.emails.send.mockRejectedValue(sendError);

      const data = {
        email: 'test@example.com',
        verificationLink: 'https://example.com/verify',
      };

      await expect(sendVerificationEmail(data)).rejects.toThrow(
        'Failed to send verification email: API rate limit exceeded',
      );
    });
  });

  describe('template integration', () => {
    test('should handle null name values', async () => {
      const { sendMagicLinkEmail } = await import('../../src/index');

      const data = {
        name: null,
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      await sendMagicLinkEmail(data);

      // Verify the email was sent with proper defaults
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        html: '<html>Mock rendered email</html>',
        subject: 'Your magic link to sign in',
        to: 'test@example.com',
      });
    });
  });
});
