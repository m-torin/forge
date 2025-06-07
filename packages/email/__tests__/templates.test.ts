import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Email Templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MagicLinkTemplate', () => {
    it('should be importable and callable', async () => {
      const { MagicLinkTemplate } = await import('../templates/magic-link');

      expect(typeof MagicLinkTemplate).toBe('function');

      const props = {
        name: 'John Doe',
        email: 'test@example.com',
        expiresIn: '30 minutes',
        magicLink: 'https://example.com/magic?token=abc123',
      };

      expect(() => MagicLinkTemplate(props)).not.toThrow();
    });

    it('should work with minimal required props', async () => {
      const { MagicLinkTemplate } = await import('../templates/magic-link');

      const props = {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic?token=abc123',
      };

      expect(() => MagicLinkTemplate(props)).not.toThrow();
    });

    it('should handle null name gracefully', async () => {
      const { MagicLinkTemplate } = await import('../templates/magic-link');

      const props = {
        name: null,
        email: 'test@example.com',
        magicLink: 'https://example.com/magic?token=abc123',
      };

      expect(() => MagicLinkTemplate(props)).not.toThrow();
    });
  });

  describe('VerificationTemplate', () => {
    it('should be importable and callable', async () => {
      const { VerificationTemplate } = await import('../templates/verification');

      expect(typeof VerificationTemplate).toBe('function');

      const props = {
        name: 'Jane Doe',
        email: 'test@example.com',
        verificationLink: 'https://example.com/verify?token=abc123',
      };

      expect(() => VerificationTemplate(props)).not.toThrow();
    });

    it('should work without name', async () => {
      const { VerificationTemplate } = await import('../templates/verification');

      const props = {
        email: 'test@example.com',
        verificationLink: 'https://example.com/verify?token=abc123',
      };

      expect(() => VerificationTemplate(props)).not.toThrow();
    });
  });

  describe('PasswordResetTemplate', () => {
    it('should be importable and callable', async () => {
      const { PasswordResetTemplate } = await import('../templates/password-reset');

      expect(typeof PasswordResetTemplate).toBe('function');

      const props = {
        name: 'Bob Smith',
        email: 'test@example.com',
        resetLink: 'https://example.com/reset?token=abc123',
      };

      expect(() => PasswordResetTemplate(props)).not.toThrow();
    });
  });

  describe('ContactTemplate', () => {
    it('should be importable and callable', async () => {
      const { ContactTemplate } = await import('../templates/contact');

      expect(typeof ContactTemplate).toBe('function');

      const props = {
        name: 'Customer Name',
        email: 'customer@example.com',
        message: 'This is my message content',
      };

      expect(() => ContactTemplate(props)).not.toThrow();
    });
  });

  describe('OrganizationInvitationTemplate', () => {
    it('should be importable and callable', async () => {
      const { OrganizationInvitationTemplate } = await import(
        '../templates/organization-invitation'
      );

      expect(typeof OrganizationInvitationTemplate).toBe('function');

      const props = {
        email: 'invite@example.com',
        expiresIn: '72 hours',
        inviteLink: 'https://example.com/invite?token=abc123',
        inviterEmail: 'admin@example.com',
        inviterName: 'John Admin',
        organizationName: 'Acme Corp',
      };

      expect(() => OrganizationInvitationTemplate(props)).not.toThrow();
    });

    it('should handle missing inviterName', async () => {
      const { OrganizationInvitationTemplate } = await import(
        '../templates/organization-invitation'
      );

      const props = {
        email: 'invite@example.com',
        expiresIn: '48 hours',
        inviteLink: 'https://example.com/invite?token=abc123',
        inviterEmail: 'admin@example.com',
        organizationName: 'Acme Corp',
      };

      expect(() => OrganizationInvitationTemplate(props)).not.toThrow();
    });
  });

  describe('WelcomeTemplate', () => {
    it('should be importable and callable', async () => {
      const { WelcomeTemplate } = await import('../templates/welcome');

      expect(typeof WelcomeTemplate).toBe('function');

      const props = {
        name: 'New User',
        dashboardUrl: 'https://app.example.com/dashboard',
        email: 'newuser@example.com',
        organizationName: 'Acme Corp',
      };

      expect(() => WelcomeTemplate(props)).not.toThrow();
    });

    it('should handle missing dashboardUrl', async () => {
      const { WelcomeTemplate } = await import('../templates/welcome');

      const props = {
        name: 'New User',
        email: 'newuser@example.com',
        organizationName: 'Acme Corp',
      };

      expect(() => WelcomeTemplate(props)).not.toThrow();
    });
  });

  describe('ApiKeyCreatedTemplate', () => {
    it('should be importable and callable', async () => {
      const { ApiKeyCreatedTemplate } = await import('../templates/api-key-created');

      expect(typeof ApiKeyCreatedTemplate).toBe('function');

      const props = {
        name: 'User Name',
        apiKeyId: 'ak_123456789',
        apiKeyName: 'Production Key',
        dashboardUrl: 'https://app.example.com/api-keys',
        email: 'user@example.com',
      };

      expect(() => ApiKeyCreatedTemplate(props)).not.toThrow();
    });

    it('should handle missing dashboardUrl', async () => {
      const { ApiKeyCreatedTemplate } = await import('../templates/api-key-created');

      const props = {
        name: 'User Name',
        apiKeyId: 'ak_test_123',
        apiKeyName: 'Test Key',
        email: 'user@example.com',
      };

      expect(() => ApiKeyCreatedTemplate(props)).not.toThrow();
    });
  });

  describe('Template structure consistency', () => {
    it('should have consistent structure across all templates', async () => {
      const templates = [
        await import('../templates/magic-link'),
        await import('../templates/verification'),
        await import('../templates/password-reset'),
        await import('../templates/contact'),
        await import('../templates/organization-invitation'),
        await import('../templates/welcome'),
        await import('../templates/api-key-created'),
      ];

      templates.forEach((template) => {
        const templateNames = Object.keys(template).filter((key) => key.includes('Template'));
        expect(templateNames.length).toBeGreaterThan(0);

        // Each template file should export the template component
        expect(template).toHaveProperty(templateNames[0]);
        expect(typeof (template as any)[templateNames[0]]).toBe('function');
      });
    });
  });

  describe('Props validation', () => {
    it('should handle required vs optional props correctly', async () => {
      const { MagicLinkTemplate } = await import('../templates/magic-link');

      // Should work with only required props
      expect(() => {
        MagicLinkTemplate({
          email: 'test@example.com',
          magicLink: 'https://example.com/link',
        });
      }).not.toThrow();

      // Should work with all props
      expect(() => {
        MagicLinkTemplate({
          name: 'Test User',
          email: 'test@example.com',
          expiresIn: '15 minutes',
          magicLink: 'https://example.com/link',
        });
      }).not.toThrow();
    });

    it('should handle readonly props correctly', async () => {
      const { ContactTemplate } = await import('../templates/contact');

      const props = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      } as const;

      expect(() => {
        ContactTemplate(props);
      }).not.toThrow();
    });
  });

  describe('Example components', () => {
    it('should export example components for development', async () => {
      const magicLinkModule = await import('../templates/magic-link');
      const contactModule = await import('../templates/contact');

      // Check for default exports (example components)
      expect(magicLinkModule.default).toBeDefined();
      expect(contactModule.default).toBeDefined();

      // Should be React components
      expect(typeof magicLinkModule.default).toBe('function');
      expect(typeof contactModule.default).toBe('function');
    });

    it('should render example components without errors', async () => {
      const { default: ExampleMagicLink } = await import('../templates/magic-link');
      const { default: ExampleContact } = await import('../templates/contact');

      expect(() => {
        ExampleMagicLink();
      }).not.toThrow();

      expect(() => {
        ExampleContact();
      }).not.toThrow();
    });
  });
});
