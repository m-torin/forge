import { beforeEach, describe, expect, vi } from 'vitest';

describe('email Package Exports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('module exports', () => {
    test('should export all email sending functions', async () => {
      const module = await import('../src/index');

      expect(module.sendMagicLinkEmail).toBeDefined();
      expect(module.sendVerificationEmail).toBeDefined();
      expect(module.sendPasswordResetEmail).toBeDefined();
      expect(module.sendContactEmail).toBeDefined();
      expect(module.sendOrganizationInvitationEmail).toBeDefined();
      expect(module.sendWelcomeEmail).toBeDefined();
      expect(module.sendApiKeyCreatedEmail).toBeDefined();

      expect(typeof module.sendMagicLinkEmail).toBe('function');
      expect(typeof module.sendVerificationEmail).toBe('function');
      expect(typeof module.sendPasswordResetEmail).toBe('function');
      expect(typeof module.sendContactEmail).toBe('function');
      expect(typeof module.sendOrganizationInvitationEmail).toBe('function');
      expect(typeof module.sendWelcomeEmail).toBe('function');
      expect(typeof module.sendApiKeyCreatedEmail).toBe('function');
    });

    test('should export all email templates', async () => {
      const module = await import('../src/index');

      expect(module.MagicLinkTemplate).toBeDefined();
      expect(module.VerificationTemplate).toBeDefined();
      expect(module.PasswordResetTemplate).toBeDefined();
      expect(module.ContactTemplate).toBeDefined();
      expect(module.OrganizationInvitationTemplate).toBeDefined();
      expect(module.WelcomeTemplate).toBeDefined();
      expect(module.ApiKeyCreatedTemplate).toBeDefined();

      expect(typeof module.MagicLinkTemplate).toBe('function');
      expect(typeof module.VerificationTemplate).toBe('function');
      expect(typeof module.PasswordResetTemplate).toBe('function');
      expect(typeof module.ContactTemplate).toBe('function');
      expect(typeof module.OrganizationInvitationTemplate).toBe('function');
      expect(typeof module.WelcomeTemplate).toBe('function');
      expect(typeof module.ApiKeyCreatedTemplate).toBe('function');
    });

    test('should export resend proxy instance', async () => {
      const module = await import('../src/index');

      expect(module.resend).toBeDefined();
      expect(typeof module.resend).toBe('object');
    });

    test('should have consistent export structure', async () => {
      const module = await import('../src/index');
      const exports = Object.keys(module);

      // Should have expected number of exports
      expect(exports.length).toBeGreaterThan(10);

      // Should include key categories
      const sendFunctions = exports.filter(exp => exp.startsWith('send'));
      const templates = exports.filter(exp => exp.includes('Template'));

      expect(sendFunctions).toHaveLength(8); // 8 send functions
      expect(templates).toHaveLength(7); // 7 templates
      expect(exports).toContain('resend');
    });
  });

  describe('template re-exports', () => {
    test('should re-export templates from their original modules', async () => {
      const indexModule = await import('../src/index');
      const magicLinkModule = await import('../src/templates/magic-link');
      const contactModule = await import('../src/templates/contact');

      expect(indexModule.MagicLinkTemplate).toBe(magicLinkModule.MagicLinkTemplate);
      expect(indexModule.ContactTemplate).toBe(contactModule.ContactTemplate);
    });

    test('should maintain template functionality through re-exports', async () => {
      const { MagicLinkTemplate } = await import('../src/index');

      const result = MagicLinkTemplate({
        name: 'Test User',
        email: 'test@example.com',
        magicLink: 'https://example.com/link',
      });

      expect(result).toBeDefined();
    });
  });

  describe('type safety', () => {
    test('should have proper TypeScript types for functions', async () => {
      const module = await import('../src/index');

      // Functions should be callable with proper parameters
      expect(() => {
        // This would fail at TypeScript compile time if types are wrong
        const fn: (data: { email: string; magicLink: string }) => Promise<any> =
          module.sendMagicLinkEmail;
        expect(fn).toBeDefined();
      }).not.toThrow();
    });
  });
});
