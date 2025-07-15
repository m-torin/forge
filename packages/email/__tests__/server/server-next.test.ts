import { describe, expect, test, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock all the actual exports from index
vi.mock('../../src/index', () => ({
  sendMagicLinkEmail: vi.fn(),
  sendVerificationEmail: vi.fn(),
  sendOTPEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendContactEmail: vi.fn(),
  sendOrganizationInvitationEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  sendApiKeyCreatedEmail: vi.fn(),
  resend: { emails: { send: vi.fn() } },
  MagicLinkTemplate: vi.fn(),
  VerificationTemplate: vi.fn(),
  PasswordResetTemplate: vi.fn(),
  ContactTemplate: vi.fn(),
  OrganizationInvitationTemplate: vi.fn(),
  WelcomeTemplate: vi.fn(),
  ApiKeyCreatedTemplate: vi.fn(),
}));

describe('server-next', () => {
  test('exports all email sending functions', async () => {
    const serverNext = await import('#/server-next');

    // Should re-export all email sending functions from index
    expect(serverNext.sendMagicLinkEmail).toBeDefined();
    expect(serverNext.sendVerificationEmail).toBeDefined();
    expect(serverNext.sendOTPEmail).toBeDefined();
    expect(serverNext.sendPasswordResetEmail).toBeDefined();
    expect(serverNext.sendContactEmail).toBeDefined();
    expect(serverNext.sendOrganizationInvitationEmail).toBeDefined();
    expect(serverNext.sendWelcomeEmail).toBeDefined();
    expect(serverNext.sendApiKeyCreatedEmail).toBeDefined();

    expect(typeof serverNext.sendMagicLinkEmail).toBe('function');
    expect(typeof serverNext.sendVerificationEmail).toBe('function');
    expect(typeof serverNext.sendOTPEmail).toBe('function');
    expect(typeof serverNext.sendPasswordResetEmail).toBe('function');
    expect(typeof serverNext.sendContactEmail).toBe('function');
    expect(typeof serverNext.sendOrganizationInvitationEmail).toBe('function');
    expect(typeof serverNext.sendWelcomeEmail).toBe('function');
    expect(typeof serverNext.sendApiKeyCreatedEmail).toBe('function');
  });

  test('exports all templates', async () => {
    const serverNext = await import('#/server-next');

    // Should re-export all templates from index
    expect(serverNext.MagicLinkTemplate).toBeDefined();
    expect(serverNext.VerificationTemplate).toBeDefined();
    expect(serverNext.PasswordResetTemplate).toBeDefined();
    expect(serverNext.ContactTemplate).toBeDefined();
    expect(serverNext.OrganizationInvitationTemplate).toBeDefined();
    expect(serverNext.WelcomeTemplate).toBeDefined();
    expect(serverNext.ApiKeyCreatedTemplate).toBeDefined();

    expect(typeof serverNext.MagicLinkTemplate).toBe('function');
    expect(typeof serverNext.PasswordResetTemplate).toBe('function');
    expect(typeof serverNext.ContactTemplate).toBe('function');
    expect(typeof serverNext.OrganizationInvitationTemplate).toBe('function');
    expect(typeof serverNext.WelcomeTemplate).toBe('function');
    expect(typeof serverNext.ApiKeyCreatedTemplate).toBe('function');
  });

  test('exports resend proxy instance', async () => {
    const serverNext = await import('#/server-next');

    // Should re-export resend instance from index
    expect(serverNext.resend).toBeDefined();
    expect(typeof serverNext.resend).toBe('object');
  });
});
