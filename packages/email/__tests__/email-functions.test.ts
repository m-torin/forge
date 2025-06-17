import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock React Email render
const mockRender = vi.fn();
vi.mock('@react-email/render', () => ({
  render: mockRender,
}));

// Mock Resend
const mockResend = {
  emails: {
    send: vi.fn(),
  },
};

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => mockResend),
}));

// Mock templates
vi.mock('../templates/magic-link', () => ({
  MagicLinkTemplate: vi
    .fn()
    .mockImplementation((props) => `MagicLinkTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../templates/verification', () => ({
  VerificationTemplate: vi
    .fn()
    .mockImplementation((props) => `VerificationTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../templates/password-reset', () => ({
  PasswordResetTemplate: vi
    .fn()
    .mockImplementation((props) => `PasswordResetTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../templates/contact', () => ({
  ContactTemplate: vi
    .fn()
    .mockImplementation((props) => `ContactTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../templates/organization-invitation', () => ({
  OrganizationInvitationTemplate: vi
    .fn()
    .mockImplementation((props) => `OrganizationInvitationTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../templates/welcome', () => ({
  WelcomeTemplate: vi
    .fn()
    .mockImplementation((props) => `WelcomeTemplate:${JSON.stringify(props)}`),
}));

vi.mock('../templates/api-key-created', () => ({
  ApiKeyCreatedTemplate: vi
    .fn()
    .mockImplementation((props) => `ApiKeyCreatedTemplate:${JSON.stringify(props)}`),
}));

// Mock keys
const mockKeys = vi.fn();
vi.mock('../keys', () => ({
  keys: mockKeys,
}));

describe('Email Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    mockKeys.mockReturnValue({
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
    it('should send magic link email with all required data', async () => {
      const { sendMagicLinkEmail } = await import('../index');

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

      expect(result).toEqual({
        data: { id: 'email_123' },
        error: null,
      });
    });

    it('should use default expiresIn when not provided', async () => {
      const { sendMagicLinkEmail } = await import('../index');
      const { MagicLinkTemplate } = await import('../templates/magic-link');

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

    it('should use fallback sender when RESEND_FROM is not set', async () => {
      mockKeys.mockReturnValue({
        RESEND_FROM: undefined,
        RESEND_TOKEN: 're_123456789',
      });

      const { sendMagicLinkEmail } = await import('../index');

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

    it('should handle render errors', async () => {
      const { sendMagicLinkEmail } = await import('../index');

      mockRender.mockRejectedValue(new Error('Template render failed'));

      const data = {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      await expect(sendMagicLinkEmail(data)).rejects.toThrow('Failed to send magic link email');
    });

    it('should handle send errors', async () => {
      const { sendMagicLinkEmail } = await import('../index');

      mockResend.emails.send.mockRejectedValue(new Error('Send failed'));

      const data = {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      await expect(sendMagicLinkEmail(data)).rejects.toThrow('Failed to send magic link email');
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      const { sendVerificationEmail } = await import('../index');
      const { VerificationTemplate } = await import('../templates/verification');

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

      expect(result).toEqual({
        data: { id: 'email_123' },
        error: null,
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const { sendPasswordResetEmail } = await import('../index');
      const { PasswordResetTemplate } = await import('../templates/password-reset');

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
  });

  describe('sendContactEmail', () => {
    it('should send contact email successfully', async () => {
      const { sendContactEmail } = await import('../index');
      const { ContactTemplate } = await import('../templates/contact');

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

    it('should use default recipient when to is not provided', async () => {
      const { sendContactEmail } = await import('../index');

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
  });

  describe('sendOrganizationInvitationEmail', () => {
    it('should send organization invitation email successfully', async () => {
      const { sendOrganizationInvitationEmail } = await import('../index');
      const { OrganizationInvitationTemplate } = await import(
        '../templates/organization-invitation'
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

    it('should use default expiresIn when not provided', async () => {
      const { sendOrganizationInvitationEmail } = await import('../index');
      const { OrganizationInvitationTemplate } = await import(
        '../templates/organization-invitation'
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
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const { sendWelcomeEmail } = await import('../index');
      const { WelcomeTemplate } = await import('../templates/welcome');

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
  });

  describe('sendApiKeyCreatedEmail', () => {
    it('should send API key created email successfully', async () => {
      const { sendApiKeyCreatedEmail } = await import('../index');
      const { ApiKeyCreatedTemplate } = await import('../templates/api-key-created');

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
  });

  describe('error handling', () => {
    it('should log and rethrow render errors', async () => {
      const { sendMagicLinkEmail } = await import('../index');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const renderError = new Error('Template compilation failed');
      mockRender.mockRejectedValue(renderError);

      const data = {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link',
      };

      await expect(sendMagicLinkEmail(data)).rejects.toThrow('Failed to send magic link email');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to send magic link email:', renderError);

      consoleSpy.mockRestore();
    });

    it('should log and rethrow send errors', async () => {
      const { sendVerificationEmail } = await import('../index');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const sendError = new Error('API rate limit exceeded');
      mockResend.emails.send.mockRejectedValue(sendError);

      const data = {
        email: 'test@example.com',
        verificationLink: 'https://example.com/verify',
      };

      await expect(sendVerificationEmail(data)).rejects.toThrow(
        'Failed to send verification email',
      );

      expect(consoleSpy).toHaveBeenCalledWith('Failed to send verification email:', sendError);

      consoleSpy.mockRestore();
    });
  });

  describe('template integration', () => {
    it('should pass all parameters correctly to templates', async () => {
      const { sendMagicLinkEmail } = await import('../index');
      const { MagicLinkTemplate } = await import('../templates/magic-link');

      const data = {
        name: 'Test User',
        email: 'test@example.com',
        expiresIn: '15 minutes',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      await sendMagicLinkEmail(data);

      expect(MagicLinkTemplate).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        expiresIn: '15 minutes',
        magicLink: 'https://example.com/magic-link?token=abc123',
      });

      expect(mockRender).toHaveBeenCalledWith(expect.stringContaining('"name": "Test User"'));
    });

    it('should handle null name values', async () => {
      const { sendMagicLinkEmail } = await import('../index');
      const { MagicLinkTemplate } = await import('../templates/magic-link');

      const data = {
        name: null,
        email: 'test@example.com',
        magicLink: 'https://example.com/magic-link?token=abc123',
      };

      await sendMagicLinkEmail(data);

      expect(MagicLinkTemplate).toHaveBeenCalledWith({
        name: null,
        email: 'test@example.com',
        expiresIn: '20 minutes',
        magicLink: 'https://example.com/magic-link?token=abc123',
      });
    });
  });
});
