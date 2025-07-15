import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('email Templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('magicLinkTemplate', () => {
    test('should be importable and callable', async () => {
      const { MagicLinkTemplate } = await import('../../src/templates/magic-link');

      expect(typeof MagicLinkTemplate).toBe('function');

      const props = {
        name: 'John Doe',
        email: 'test@example.com',
        expiresIn: '30 minutes',
        magicLink: 'https://example.com/magic?token=abc123',
      };

      expect(() => MagicLinkTemplate(props)).not.toThrow();
    });

    test('should work with minimal required props', async () => {
      const { MagicLinkTemplate } = await import('../../src/templates/magic-link');

      const props = {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic?token=abc123',
      };

      expect(() => MagicLinkTemplate(props)).not.toThrow();
    });

    test('should handle null name gracefully', async () => {
      const { MagicLinkTemplate } = await import('../../src/templates/magic-link');

      const props = {
        name: null,
        email: 'test@example.com',
        magicLink: 'https://example.com/magic?token=abc123',
      };

      expect(() => MagicLinkTemplate(props)).not.toThrow();
    });

    test('should render example template', async () => {
      const ExampleMagicLinkEmail = (await import('../../src/templates/magic-link')).default;

      expect(typeof ExampleMagicLinkEmail).toBe('function');
      expect(() => ExampleMagicLinkEmail()).not.toThrow();
    });
  });

  describe('verificationTemplate', () => {
    test('should be importable and callable', async () => {
      const { VerificationTemplate } = await import('../../src/templates/verification');

      expect(typeof VerificationTemplate).toBe('function');

      const props = {
        name: 'Jane Doe',
        email: 'test@example.com',
        verificationLink: 'https://example.com/verify?token=abc123',
      };

      expect(() => VerificationTemplate(props)).not.toThrow();
    });

    test('should work without name', async () => {
      const { VerificationTemplate } = await import('../../src/templates/verification');

      const props = {
        email: 'test@example.com',
        verificationLink: 'https://example.com/verify?token=abc123',
      };

      expect(() => VerificationTemplate(props)).not.toThrow();
    });

    test('should render example template', async () => {
      const ExampleVerificationEmail = (await import('../../src/templates/verification')).default;

      expect(typeof ExampleVerificationEmail).toBe('function');
      expect(() => ExampleVerificationEmail()).not.toThrow();
    });
  });

  describe('passwordResetTemplate', () => {
    test('should be importable and callable', async () => {
      const { PasswordResetTemplate } = await import('../../src/templates/password-reset');

      expect(typeof PasswordResetTemplate).toBe('function');

      const props = {
        name: 'Bob Smith',
        email: 'test@example.com',
        resetLink: 'https://example.com/reset?token=abc123',
      };

      expect(() => PasswordResetTemplate(props)).not.toThrow();
    });

    test('should render example template', async () => {
      const ExamplePasswordResetEmail = (await import('../../src/templates/password-reset'))
        .default;

      expect(typeof ExamplePasswordResetEmail).toBe('function');
      expect(() => ExamplePasswordResetEmail()).not.toThrow();
    });
  });

  describe('contactTemplate', () => {
    test('should be importable and callable', async () => {
      const { ContactTemplate } = await import('../../src/templates/contact');

      expect(typeof ContactTemplate).toBe('function');

      const props = {
        name: 'Customer Name',
        email: 'customer@example.com',
        message: 'This is my message content',
      };

      expect(() => ContactTemplate(props)).not.toThrow();
    });

    test('should render example template', async () => {
      const ExampleContactEmail = (await import('../../src/templates/contact')).default;

      expect(typeof ExampleContactEmail).toBe('function');
      expect(() => ExampleContactEmail()).not.toThrow();
    });
  });

  describe('organizationInvitationTemplate', () => {
    test('should be importable and callable', async () => {
      const { OrganizationInvitationTemplate } = await import(
        '../../src/templates/organization-invitation'
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

    test('should handle missing inviterName', async () => {
      const { OrganizationInvitationTemplate } = await import(
        '../../src/templates/organization-invitation'
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

    test('should render example template', async () => {
      const ExampleOrganizationInvitationEmail = (
        await import('../../src/templates/organization-invitation')
      ).default;

      expect(typeof ExampleOrganizationInvitationEmail).toBe('function');
      expect(() => ExampleOrganizationInvitationEmail()).not.toThrow();
    });
  });

  describe('welcomeTemplate', () => {
    test('should be importable and callable', async () => {
      const { WelcomeTemplate } = await import('../../src/templates/welcome');

      expect(typeof WelcomeTemplate).toBe('function');

      const props = {
        name: 'New User',
        dashboardUrl: 'https://app.example.com/dashboard',
        email: 'newuser@example.com',
        organizationName: 'Acme Corp',
      };

      expect(() => WelcomeTemplate(props)).not.toThrow();
    });

    test('should handle missing dashboardUrl', async () => {
      const { WelcomeTemplate } = await import('../../src/templates/welcome');

      const props = {
        name: 'New User',
        email: 'newuser@example.com',
        organizationName: 'Acme Corp',
      };

      expect(() => WelcomeTemplate(props)).not.toThrow();
    });

    test('should render example template', async () => {
      const ExampleWelcomeEmail = (await import('../../src/templates/welcome')).default;

      expect(typeof ExampleWelcomeEmail).toBe('function');
      expect(() => ExampleWelcomeEmail()).not.toThrow();
    });
  });

  describe('apiKeyCreatedTemplate', () => {
    test('should be importable and callable', async () => {
      const { ApiKeyCreatedTemplate } = await import('../../src/templates/api-key-created');

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

    test('should handle missing dashboardUrl', async () => {
      const { ApiKeyCreatedTemplate } = await import('../../src/templates/api-key-created');

      const props = {
        name: 'User Name',
        apiKeyId: 'ak_test_123',
        apiKeyName: 'Test Key',
        email: 'user@example.com',
      };

      expect(() => ApiKeyCreatedTemplate(props)).not.toThrow();
    });

    test('should render example template', async () => {
      const ExampleApiKeyCreatedEmail = (await import('../../src/templates/api-key-created'))
        .default;

      expect(typeof ExampleApiKeyCreatedEmail).toBe('function');
      expect(() => ExampleApiKeyCreatedEmail()).not.toThrow();
    });
  });

  describe('template structure consistency', () => {
    test('should have consistent structure across all templates', async () => {
      const templates = [
        await import('../../src/templates/magic-link'),
        await import('../../src/templates/verification'),
        await import('../../src/templates/password-reset'),
        await import('../../src/templates/contact'),
        await import('../../src/templates/organization-invitation'),
        await import('../../src/templates/welcome'),
        await import('../../src/templates/api-key-created'),
      ];

      templates.forEach(template => {
        const templateNames = Object.keys(template).filter(key => key.includes('Template'));
        expect(templateNames.length).toBeGreaterThan(0);

        // Each template file should export the template component
        expect(template).toHaveProperty(templateNames[0]);
        expect(typeof (template as any)[templateNames[0]]).toBe('function');
      });
    });
  });

  describe('props validation', () => {
    test('should handle required vs optional props correctly', async () => {
      const { MagicLinkTemplate } = await import('../../src/templates/magic-link');

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

    test('should handle readonly props correctly', async () => {
      const { ContactTemplate } = await import('../../src/templates/contact');

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

  describe('example components', () => {
    test('should export example components for development', async () => {
      const magicLinkModule = await import('../../src/templates/magic-link');
      const contactModule = await import('../../src/templates/contact');

      // Check for default exports (example components)
      expect(magicLinkModule.default).toBeDefined();
      expect(contactModule.default).toBeDefined();

      // Should be React components
      expect(typeof magicLinkModule.default).toBe('function');
      expect(typeof contactModule.default).toBe('function');
    });

    test('should render example components without errors', async () => {
      const { default: ExampleMagicLink } = await import('../../src/templates/magic-link');
      const { default: ExampleContact } = await import('../../src/templates/contact');

      expect(() => {
        ExampleMagicLink();
      }).not.toThrow();

      expect(() => {
        ExampleContact();
      }).not.toThrow();
    });
  });
});
