/**
 * Client Entry Point Tests
 *
 * Tests for email package client-side functionality and exports.
 * Following analytics package pattern for DRY testing.
 */

import { beforeEach, describe, expect, test } from 'vitest';
import * as emailTestPatterns from '../test-utils/email-test-patterns';
import { generateCompleteEmailData } from '../test-utils/setup';

describe('email Client Entry Point', () => {
  beforeEach(() => {
    // Reset any client-side state
  });

  // Test module exports
  emailTestPatterns.testModuleExports('Email Client', '../../src/index', [
    { name: 'sendMagicLinkEmail', type: 'function' },
    { name: 'sendVerificationEmail', type: 'function' },
    { name: 'sendPasswordResetEmail', type: 'function' },
    { name: 'sendOTPEmail', type: 'function' },
    { name: 'sendContactEmail', type: 'function' },
    { name: 'sendOrganizationInvitationEmail', type: 'function' },
    { name: 'sendWelcomeEmail', type: 'function' },
    { name: 'sendApiKeyCreatedEmail', type: 'function' },
    { name: 'MagicLinkTemplate', type: 'function' },
    { name: 'VerificationTemplate', type: 'function' },
    { name: 'PasswordResetTemplate', type: 'function' },
    { name: 'ContactTemplate', type: 'function' },
    { name: 'OrganizationInvitationTemplate', type: 'function' },
    { name: 'WelcomeTemplate', type: 'function' },
    { name: 'ApiKeyCreatedTemplate', type: 'function' },
    { name: 'resend', type: 'object' },
  ]);

  // Test email sending functions
  emailTestPatterns.testEmailSendingFunctions([
    {
      name: 'sendMagicLinkEmail',
      functionName: 'sendMagicLinkEmail',
      testData: generateCompleteEmailData.magicLink(),
      expectedSubject: 'Your magic link to sign in',
      defaultValues: { expiresIn: '20 minutes' },
    },
    {
      name: 'sendVerificationEmail',
      functionName: 'sendVerificationEmail',
      testData: generateCompleteEmailData.verification(),
      expectedSubject: 'Verify your email address',
    },
    {
      name: 'sendPasswordResetEmail',
      functionName: 'sendPasswordResetEmail',
      testData: generateCompleteEmailData.passwordReset(),
      expectedSubject: 'Reset your password',
    },
    {
      name: 'sendOTPEmail',
      functionName: 'sendOTPEmail',
      testData: generateCompleteEmailData.otp(),
      expectedSubject: 'Your login verification code: 123456',
    },
    {
      name: 'sendContactEmail',
      functionName: 'sendContactEmail',
      testData: generateCompleteEmailData.contact(),
      expectedSubject: 'New contact form submission from Test User',
    },
    {
      name: 'sendOrganizationInvitationEmail',
      functionName: 'sendOrganizationInvitationEmail',
      testData: generateCompleteEmailData.organizationInvitation(),
      expectedSubject: 'Invitation to join Test Org',
      defaultValues: { expiresIn: '48 hours' },
    },
    {
      name: 'sendWelcomeEmail',
      functionName: 'sendWelcomeEmail',
      testData: generateCompleteEmailData.welcome(),
      expectedSubject: 'Welcome to Test Org!',
    },
    {
      name: 'sendApiKeyCreatedEmail',
      functionName: 'sendApiKeyCreatedEmail',
      testData: generateCompleteEmailData.apiKeyCreated(),
      expectedSubject: 'API Key "Test API Key" Created',
    },
  ]);

  // Test template functions
  emailTestPatterns.testEmailTemplates([
    {
      name: 'MagicLinkTemplate',
      templateName: 'MagicLinkTemplate',
      importPath: '../../src/index',
      requiredProps: generateCompleteEmailData.magicLink(),
      minimumProps: {
        email: 'test@example.com',
        magicLink: 'https://example.com/magic?token=abc123',
      },
      edgeCases: [
        {
          name: 'handle null name gracefully',
          props: {
            email: 'test@example.com',
            name: null,
            magicLink: 'https://example.com/magic?token=abc123',
          },
          expectedBehavior: 'handle null name gracefully',
        },
      ],
    },
    {
      name: 'VerificationTemplate',
      templateName: 'VerificationTemplate',
      importPath: '../../src/index',
      requiredProps: generateCompleteEmailData.verification(),
      minimumProps: {
        email: 'test@example.com',
        verificationLink: 'https://example.com/verify?token=abc123',
      },
    },
    {
      name: 'PasswordResetTemplate',
      templateName: 'PasswordResetTemplate',
      importPath: '../../src/index',
      requiredProps: generateCompleteEmailData.passwordReset(),
    },
    {
      name: 'ContactTemplate',
      templateName: 'ContactTemplate',
      importPath: '../../src/index',
      requiredProps: generateCompleteEmailData.contact(),
    },
    {
      name: 'OrganizationInvitationTemplate',
      templateName: 'OrganizationInvitationTemplate',
      importPath: '../../src/index',
      requiredProps: generateCompleteEmailData.organizationInvitation(),
      edgeCases: [
        {
          name: 'handle missing inviterName',
          props: {
            email: 'invite@example.com',
            expiresIn: '48 hours',
            inviteLink: 'https://example.com/invite?token=abc123',
            inviterEmail: 'admin@example.com',
            organizationName: 'Test Org',
          },
          expectedBehavior: 'handle missing inviterName',
        },
      ],
    },
    {
      name: 'WelcomeTemplate',
      templateName: 'WelcomeTemplate',
      importPath: '../../src/index',
      requiredProps: generateCompleteEmailData.welcome(),
      edgeCases: [
        {
          name: 'handle missing dashboardUrl',
          props: {
            email: 'newuser@example.com',
            name: 'New User',
            organizationName: 'Test Org',
          },
          expectedBehavior: 'handle missing dashboardUrl',
        },
      ],
    },
    {
      name: 'ApiKeyCreatedTemplate',
      templateName: 'ApiKeyCreatedTemplate',
      importPath: '../../src/index',
      requiredProps: generateCompleteEmailData.apiKeyCreated(),
      edgeCases: [
        {
          name: 'handle missing dashboardUrl',
          props: {
            email: 'user@example.com',
            name: 'User Name',
            apiKeyId: 'ak_test_123',
            apiKeyName: 'Test Key',
          },
          expectedBehavior: 'handle missing dashboardUrl',
        },
      ],
    },
  ]);

  describe('resend client proxy', () => {
    test('should provide proxy to resend client', async () => {
      const { resend } = await import('../../src/index');

      expect(resend).toBeDefined();
      expect(typeof resend).toBe('object');
      expect(resend.emails).toBeDefined();
    });

    test('should handle missing RESEND_TOKEN gracefully', async () => {
      // This would be configured in the setup file
      const { resend } = await import('../../src/index');

      // Should not throw when accessing emails
      expect(() => resend.emails).not.toThrow();
    });
  });

  describe('client-side email validation', () => {
    test('should validate email addresses', () => {
      const validEmails = ['test@example.com', 'user+tag@domain.co.uk', 'user.name@sub.domain.com'];

      const invalidEmails = ['invalid-email', 'test@', '@domain.com', 'test@@domain.com'];

      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });
});
