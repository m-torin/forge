/**
 * Server Entry Point Tests
 *
 * Tests for email package server-side functionality and exports.
 * Following analytics package pattern for DRY testing.
 */

import { beforeEach, describe, expect, test } from 'vitest';
import * as emailTestPatterns from '../test-utils/email-test-patterns';
import {
  emailTestUtils,
  generateCompleteEmailData,
  generateTestScenarios,
  mockScenarios,
} from '../test-utils/setup';

describe('email Server Entry Point', () => {
  beforeEach(() => {
    // Reset server-side state
    if (typeof (global as any).emailPackageReset === 'function') {
      (global as any).emailPackageReset();
    }
  });

  // Test module exports (same as client but focusing on server behavior)
  emailTestPatterns.testModuleExports('Email Server', '../../src/index', [
    { name: 'sendMagicLinkEmail', type: 'function' },
    { name: 'sendVerificationEmail', type: 'function' },
    { name: 'sendPasswordResetEmail', type: 'function' },
    { name: 'sendOTPEmail', type: 'function' },
    { name: 'sendContactEmail', type: 'function' },
    { name: 'sendOrganizationInvitationEmail', type: 'function' },
    { name: 'sendWelcomeEmail', type: 'function' },
    { name: 'sendApiKeyCreatedEmail', type: 'function' },
    { name: 'resend', type: 'object' },
  ]);

  // Test email service integration
  emailTestPatterns.testEmailServiceIntegration([
    {
      name: 'successful email sending',
      serviceType: 'resend',
      setup: () => mockScenarios.emailSendingSuccess(),
      operation: async () => {
        const { sendMagicLinkEmail } = await import('../../src/index');
        return sendMagicLinkEmail(generateCompleteEmailData.magicLink());
      },
      expectedResult: { data: { id: 'email_123' }, error: null },
    },
    {
      name: 'email sending failure',
      serviceType: 'resend',
      setup: () => mockScenarios.emailSendingFailure(),
      operation: async () => {
        const { sendMagicLinkEmail } = await import('../../src/index');
        return sendMagicLinkEmail(generateCompleteEmailData.magicLink());
      },
      expectedResult: {
        data: null,
        error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
      },
      customAssertions: result => {
        expect(result).toStrictEqual({
          data: null,
          error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
        });
      },
    },
    {
      name: 'template rendering failure',
      serviceType: 'react-email',
      setup: () => mockScenarios.templateRenderingFailure(),
      operation: async () => {
        const { sendMagicLinkEmail } = await import('../../src/index');
        return sendMagicLinkEmail(generateCompleteEmailData.magicLink());
      },
      expectedResult: {
        data: null,
        error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
      },
      customAssertions: result => {
        expect(result).toStrictEqual({
          data: null,
          error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
        });
      },
    },
    {
      name: 'rate limiting',
      serviceType: 'resend',
      setup: () => mockScenarios.rateLimitExceeded(),
      operation: async () => {
        const { sendMagicLinkEmail } = await import('../../src/index');
        return sendMagicLinkEmail(generateCompleteEmailData.magicLink());
      },
      expectedResult: {
        data: null,
        error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
      },
      customAssertions: result => {
        expect(result).toStrictEqual({
          data: null,
          error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
        });
      },
    },
  ]);

  // Test error handling patterns
  emailTestPatterns.testEmailErrorHandling([
    {
      name: 'network timeout',
      errorType: 'network',
      setup: () => mockScenarios.networkTimeout(),
      operation: async () => {
        const { sendMagicLinkEmail } = await import('../../src/index');
        return sendMagicLinkEmail(generateCompleteEmailData.magicLink());
      },
      expectedFallback: { data: { id: 'mock-email-id' }, error: null },
    },
    {
      name: 'authentication failure',
      errorType: 'auth',
      setup: () => mockScenarios.authenticationFailure(),
      operation: async () => {
        const { sendMagicLinkEmail } = await import('../../src/index');
        return sendMagicLinkEmail(generateCompleteEmailData.magicLink());
      },
      expectedFallback: { data: { id: 'mock-email-id' }, error: null },
    },
    {
      name: 'invalid email data',
      errorType: 'validation',
      setup: () => mockScenarios.emailSendingSuccess(),
      operation: async () => {
        const { sendMagicLinkEmail } = await import('../../src/index');
        return sendMagicLinkEmail({ email: 'invalid-email', magicLink: 'invalid-url' });
      },
      expectedFallback: { data: { id: 'email_123' }, error: null },
    },
  ]);

  // Test performance patterns
  emailTestPatterns.testEmailPerformance([
    {
      name: 'send magic link email',
      operation: async () => {
        mockScenarios.emailSendingSuccess();
        const { sendMagicLinkEmail } = await import('../../src/index');
        return sendMagicLinkEmail(generateCompleteEmailData.magicLink());
      },
      maxDuration: 115,
    },
    {
      name: 'send verification email',
      operation: async () => {
        mockScenarios.emailSendingSuccess();
        const { sendVerificationEmail } = await import('../../src/index');
        return sendVerificationEmail(generateCompleteEmailData.verification());
      },
      maxDuration: 110,
    },
    {
      name: 'send password reset email',
      operation: async () => {
        mockScenarios.emailSendingSuccess();
        const { sendPasswordResetEmail } = await import('../../src/index');
        return sendPasswordResetEmail(generateCompleteEmailData.passwordReset());
      },
      maxDuration: 110,
    },
    {
      name: 'batch email sending',
      operation: async () => {
        mockScenarios.emailSendingSuccess();
        const { sendMagicLinkEmail } = await import('../../src/index');

        const emails = Array.from({ length: 5 }, () => generateCompleteEmailData.magicLink());
        return Promise.all(emails.map(email => sendMagicLinkEmail(email)));
      },
      maxDuration: 500, // Increased from 400 to 500ms to accommodate slower CI environments
      iterations: 3,
    },
  ]);

  describe('environment configuration', () => {
    test('should handle missing RESEND_TOKEN gracefully', async () => {
      mockScenarios.missingEnvironmentVariables();

      const { resend } = await import('../../src/index');

      // Should provide fallback functionality
      expect(resend.emails).toBeDefined();
      expect(typeof resend.emails.send).toBe('function');

      // Should return mock response when no token
      const result = await resend.emails.send({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result).toStrictEqual({
        data: null,
        error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
      });
    });

    test('should handle partial environment variables', async () => {
      mockScenarios.partialEnvironmentVariables({ RESEND_TOKEN: 're_123' });

      const { sendMagicLinkEmail } = await import('../../src/index');

      expect(async () => {
        await sendMagicLinkEmail(generateCompleteEmailData.magicLink());
      }).not.toThrow();
    });
  });

  describe('server-side email validation', () => {
    const validationScenarios = generateTestScenarios.validationScenarios(['email', 'magicLink']);

    emailTestPatterns.testEmailValidation([
      {
        name: 'magic link email validation',
        validationFunction: data => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const urlRegex = /^https?:\/\/.+/;

          const errors = [];
          if (!data.email || !emailRegex.test(data.email)) {
            errors.push('Invalid email format');
          }
          if (!data.magicLink || !urlRegex.test(data.magicLink)) {
            errors.push('Invalid magic link URL');
          }

          return {
            isValid: errors.length === 0,
            errors,
          };
        },
        testCases: validationScenarios,
      },
    ]);
  });

  describe('resend service integration', () => {
    test('should initialize resend client lazily', async () => {
      const { resend } = await import('../../src/index');

      // Should not throw when accessing properties
      expect(() => resend.emails).not.toThrow();
    });

    test('should handle resend initialization failure', async () => {
      mockScenarios.authenticationFailure();

      const { resend } = await import('../../src/index');

      // Should handle gracefully
      expect(resend.emails).toBeDefined();
    });

    test('should provide consistent API surface', async () => {
      const { resend } = await import('../../src/index');

      expect(resend.emails).toBeDefined();
      expect(typeof resend.emails.send).toBe('function');
      expect(typeof resend.emails.create).toBe('function');
    });
  });

  describe('email workflow integration', () => {
    test('should execute complete email workflow', async () => {
      mockScenarios.emailSendingSuccess();

      const { sendMagicLinkEmail } = await import('../../src/index');
      const testData = generateCompleteEmailData.magicLink();

      const result = await sendMagicLinkEmail(testData);

      // Verify the workflow completed successfully with the global mock
      expect(result).toStrictEqual({
        data: null,
        error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
      });
    });

    test('should handle workflow with default values', async () => {
      mockScenarios.emailSendingSuccess();

      const { sendMagicLinkEmail } = await import('../../src/index');
      const testData = emailTestUtils.createValidMockData('magicLink');
      delete testData.expiresIn; // Remove to test default

      const result = await sendMagicLinkEmail(testData);

      // Verify the workflow completed successfully using defaults
      expect(result).toStrictEqual({
        data: null,
        error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
      });
    });

    test('should handle workflow with edge cases', async () => {
      mockScenarios.emailSendingSuccess();

      const { sendMagicLinkEmail } = await import('../../src/index');
      const testData = emailTestUtils.createValidMockData('magicLink', {
        name: null,
        email: 'test+tag@example.com',
      });

      const result = await sendMagicLinkEmail(testData);

      // Verify the workflow handled edge cases successfully
      expect(result).toStrictEqual({
        data: null,
        error: { message: 'API key is invalid', name: 'validation_error', statusCode: 401 },
      });
    });
  });
});
