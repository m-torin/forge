/**
 * Email Package Test Setup
 *
 * Uses centralized mocks from @repo/qa for consistency across the monorepo.
 */

import { afterEach, beforeEach, vi } from 'vitest';
// Temporarily import from main QA index due to deep export path issues
// TODO: Re-enable direct path when @repo/qa deep exports are fixed
// import { createEmailTestScenarios, createEmailTestData, resetCommunicationMocks } from '@repo/qa/vitest/mocks/internal/email';
import { createEmailTestData, createEmailTestScenarios, resetCommunicationMocks } from '@repo/qa';

// ================================================================================================
// GLOBAL TEST CONFIGURATION
// ================================================================================================

/**
 * Global test setup - runs before all tests
 */
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Reset environment variables to ensure clean state
  vi.unstubAllEnvs();

  // Reset email package state for testing
  if (typeof (global as any).emailPackageReset === 'function') {
    (global as any).emailPackageReset();
  }

  // Setup global logger mock for email package
  (global as any).mockLogger = {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
});

/**
 * Global test cleanup - runs after all tests
 */
afterEach(() => {
  // Clean up any test artifacts
  resetCommunicationMocks();

  // Reset environment variables to ensure clean state
  vi.unstubAllEnvs();

  // Reset any global state
  if (typeof (global as any).emailPackageReset === 'function') {
    (global as any).emailPackageReset();
  }
});

// ================================================================================================
// CENTRALIZED MOCK SCENARIOS (FROM @repo/qa)
// ================================================================================================

/**
 * Email test scenarios using centralized QA mocks
 */
export const mockScenarios = createEmailTestScenarios();

/**
 * Email test utilities using centralized QA utilities
 */
export const emailTestUtils = createEmailTestData();

// ================================================================================================
// EMAIL-SPECIFIC TEST HELPERS
// ================================================================================================

/**
 * Generates complete email data for testing
 */
export const generateCompleteEmailData = {
  magicLink: () => emailTestUtils.createValidMockData('magicLink'),
  verification: () => emailTestUtils.createValidMockData('verification'),
  passwordReset: () => emailTestUtils.createValidMockData('passwordReset'),
  otp: () => emailTestUtils.createValidMockData('otp'),
  contact: () => emailTestUtils.createValidMockData('contact'),
  organizationInvitation: () => emailTestUtils.createValidMockData('organizationInvitation'),
  welcome: () => emailTestUtils.createValidMockData('welcome'),
  apiKeyCreated: () => emailTestUtils.createValidMockData('apiKeyCreated'),
};

/**
 * Generates test scenarios for validation
 */
export const generateTestScenarios = {
  validationScenarios: (fields: string[]) => [
    {
      name: 'valid data',
      data: fields.reduce((acc, field) => {
        switch (field) {
          case 'email':
            acc.email = 'test@example.com';
            break;
          case 'magicLink':
            acc.magicLink = 'https://example.com/magic?token=abc123';
            break;
          default:
            acc[field] = `valid-${field}`;
        }
        return acc;
      }, {} as any),
      expectedValid: true,
    },
    {
      name: 'invalid email',
      data: fields.reduce((acc, field) => {
        switch (field) {
          case 'email':
            acc.email = 'invalid-email';
            break;
          case 'magicLink':
            acc.magicLink = 'https://example.com/magic?token=abc123';
            break;
          default:
            acc[field] = `valid-${field}`;
        }
        return acc;
      }, {} as any),
      expectedValid: false,
    },
  ],
};

// ================================================================================================
// ASSERTION HELPERS
// ================================================================================================

/**
 * Custom assertion helpers for email testing
 */
export const emailAssertions = {
  /**
   * Asserts email was sent with correct parameters
   */
  expectEmailSentWith: (
    mockSend: any,
    expectedParams: {
      from: string;
      to: string;
      subject: string;
      html?: string;
    },
  ) => {
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expectedParams.from,
        to: expectedParams.to,
        subject: expectedParams.subject,
        html: expectedParams.html || expect.any(String),
      }),
    );
  },

  /**
   * Asserts template was rendered with correct props
   */
  expectTemplateRenderedWith: (mockRender: any, expectedTemplate: any) => {
    expect(mockRender).toHaveBeenCalledWith(expectedTemplate);
  },

  /**
   * Asserts email result structure
   */
  expectEmailResult: (
    result: any,
    expectedResult: any = { data: { id: expect.any(String) }, error: null },
  ) => {
    expect(result).toStrictEqual(expectedResult);
  },

  /**
   * Asserts error was thrown with correct message
   */
  expectErrorThrown: (error: any, expectedMessage: string) => {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain(expectedMessage);
  },
};

// ================================================================================================
// TEST CONFIGURATION
// ================================================================================================

export const testConfig = {
  timeout: 10000, // 10 seconds default timeout
  retries: 2, // Retry failed tests twice
  performance: {
    templateRender: 10, // 10ms max for template rendering
    emailSending: 50, // 50ms max for email sending
    batchProcessing: 200, // 200ms max for batch operations
  },
  mock: {
    defaultDelay: 0, // No delay by default
    networkDelay: 100, // 100ms for network simulation
    timeoutDelay: 5000, // 5 seconds for timeout tests
  },
};
