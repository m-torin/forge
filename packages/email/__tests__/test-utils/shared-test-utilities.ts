/**
 * Shared test utilities for email tests
 * Reduces code duplication and provides consistent test patterns
 */

import { expect, vi } from 'vitest';

// ============================================================================
// MOCK UTILITIES
// ============================================================================

/**
 * Creates consistent mock for Resend email service
 */
export function createResendMock() {
  return {
    emails: {
      send: vi.fn(),
      create: vi.fn(),
    },
  };
}

/**
 * Creates consistent mock for React Email render function
 */
export function createReactEmailRenderMock() {
  return vi.fn().mockResolvedValue('<html>Mock rendered email</html>');
}

/**
 * Creates consistent mock for email templates
 */
export function createEmailTemplateMock(templateName: string) {
  return vi.fn().mockImplementation(props => `${templateName}:${JSON.stringify(props)}`);
}

/**
 * Creates consistent mock for environment variables
 */
export function createEmailEnvMock() {
  return vi.fn().mockReturnValue({
    RESEND_FROM: 'noreply@example.com',
    RESEND_TOKEN: 're_123456789',
  });
}

/**
 * Standard mock setup for all email tests
 */
export function setupEmailMocks() {
  return {
    resend: createResendMock(),
    render: createReactEmailRenderMock(),
    env: createEmailEnvMock(),
    templates: {
      MagicLinkTemplate: createEmailTemplateMock('MagicLinkTemplate'),
      VerificationTemplate: createEmailTemplateMock('VerificationTemplate'),
      PasswordResetTemplate: createEmailTemplateMock('PasswordResetTemplate'),
      ContactTemplate: createEmailTemplateMock('ContactTemplate'),
      OrganizationInvitationTemplate: createEmailTemplateMock('OrganizationInvitationTemplate'),
      WelcomeTemplate: createEmailTemplateMock('WelcomeTemplate'),
      ApiKeyCreatedTemplate: createEmailTemplateMock('ApiKeyCreatedTemplate'),
    },
  };
}

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Creates base email data for testing
 */
export function createBaseEmailData(overrides: any = {}) {
  return {
    email: 'test@example.com',
    name: 'Test User',
    subject: 'Test Email',
    from: 'noreply@example.com',
    ...overrides,
  };
}

/**
 * Creates magic link email data for testing
 */
export function createMagicLinkEmailData(overrides: any = {}) {
  return {
    email: 'test@example.com',
    name: 'John Doe',
    expiresIn: '30 minutes',
    magicLink: 'https://example.com/magic?token=abc123',
    ...overrides,
  };
}

/**
 * Creates verification email data for testing
 */
export function createVerificationEmailData(overrides: any = {}) {
  return {
    email: 'test@example.com',
    name: 'Jane Doe',
    verificationLink: 'https://example.com/verify?token=abc123',
    ...overrides,
  };
}

/**
 * Creates password reset email data for testing
 */
export function createPasswordResetEmailData(overrides: any = {}) {
  return {
    email: 'test@example.com',
    name: 'Bob Smith',
    resetLink: 'https://example.com/reset?token=abc123',
    ...overrides,
  };
}

/**
 * Creates OTP email data for testing
 */
export function createOTPEmailData(overrides: any = {}) {
  return {
    email: 'test@example.com',
    name: 'Test User',
    otp: '123456',
    purpose: 'login verification',
    ...overrides,
  };
}

/**
 * Creates contact email data for testing
 */
export function createContactEmailData(overrides: any = {}) {
  return {
    email: 'customer@example.com',
    name: 'Customer Name',
    message: 'This is a test contact message',
    to: 'support@example.com',
    ...overrides,
  };
}

/**
 * Creates organization invitation email data for testing
 */
export function createOrganizationInvitationEmailData(overrides: any = {}) {
  return {
    email: 'invite@example.com',
    expiresIn: '72 hours',
    inviteLink: 'https://example.com/invite?token=abc123',
    inviterEmail: 'admin@example.com',
    inviterName: 'John Admin',
    organizationName: 'Acme Corp',
    ...overrides,
  };
}

/**
 * Creates welcome email data for testing
 */
export function createWelcomeEmailData(overrides: any = {}) {
  return {
    email: 'newuser@example.com',
    name: 'New User',
    dashboardUrl: 'https://app.example.com/dashboard',
    organizationName: 'Acme Corp',
    ...overrides,
  };
}

/**
 * Creates API key created email data for testing
 */
export function createApiKeyCreatedEmailData(overrides: any = {}) {
  return {
    email: 'user@example.com',
    name: 'User Name',
    apiKeyId: 'ak_123456789',
    apiKeyName: 'Production API Key',
    dashboardUrl: 'https://app.example.com/api-keys',
    ...overrides,
  };
}

/**
 * Creates Resend API response for testing
 */
export function createResendResponse(overrides: any = {}) {
  return {
    data: { id: 'email_123' },
    error: null,
    ...overrides,
  };
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Validates standard email sending result
 */
export function validateEmailSendingResult(
  result: any,
  expectedEmailData: any,
  expectedSubject: string,
) {
  expect(result).toStrictEqual({
    data: { id: 'email_123' },
    error: null,
  });
}

/**
 * Validates that email was sent with correct parameters
 */
export function validateEmailSentWith(
  mockSend: any,
  expectedParams: {
    from: string;
    to: string;
    subject: string;
    html?: string;
  },
) {
  expect(mockSend).toHaveBeenCalledWith({
    from: expectedParams.from,
    to: expectedParams.to,
    subject: expectedParams.subject,
    html: expectedParams.html || '<html>Mock rendered email</html>',
  });
}

/**
 * Validates that template was called with correct props
 */
export function validateTemplateCalledWith(mockTemplate: any, expectedProps: any) {
  expect(mockTemplate).toHaveBeenCalledWith(expectedProps);
}

/**
 * Validates email address format
 */
export function validateEmailFormat(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  expect(email).toMatch(emailRegex);
}

/**
 * Validates required email properties
 */
export function validateRequiredEmailProperties(emailData: any, requiredProperties: string[]) {
  requiredProperties.forEach(prop => {
    expect(emailData).toHaveProperty(prop);
    expect(emailData[prop]).toBeDefined();
  });
}

/**
 * Validates template props structure
 */
export function validateTemplateProps(
  props: any,
  requiredProps: string[],
  optionalProps: string[] = [],
) {
  // Check required props
  requiredProps.forEach(prop => {
    expect(props).toHaveProperty(prop);
    expect(props[prop]).toBeDefined();
  });

  // Check that only expected props are present
  const expectedProps = [...requiredProps, ...optionalProps];
  Object.keys(props).forEach(prop => {
    expect(expectedProps).toContain(prop);
  });
}

// ============================================================================
// TEST SCENARIO GENERATORS
// ============================================================================

/**
 * Generates test scenarios for email sending functions
 */
export function generateEmailSendingTestScenarios<T>(
  emailFunction: (data: T) => Promise<any>,
  baseData: T,
  scenarios: Array<{
    name: string;
    data: Partial<T>;
    expectation: (result: any) => void;
  }>,
) {
  return scenarios.map(scenario => ({
    name: scenario.name,
    test: async () => {
      const testData = { ...baseData, ...scenario.data };
      const result = await emailFunction(testData);
      scenario.expectation(result);
    },
  }));
}

/**
 * Generates test scenarios for template rendering
 */
export function generateTemplateRenderingTestScenarios<T>(
  templateFunction: (props: T) => any,
  baseProps: T,
  scenarios: Array<{
    name: string;
    props: Partial<T>;
    shouldNotThrow?: boolean;
  }>,
) {
  return scenarios.map(scenario => ({
    name: scenario.name,
    test: () => {
      const testProps = { ...baseProps, ...scenario.props };

      if (scenario.shouldNotThrow !== false) {
        expect(() => templateFunction(testProps)).not.toThrow();
      } else {
        expect(() => templateFunction(testProps)).toThrow();
      }
    },
  }));
}

/**
 * Generates error handling test scenarios
 */
export function generateErrorHandlingTestScenarios<T>(
  emailFunction: (data: T) => Promise<any>,
  baseData: T,
  errorScenarios: Array<{
    name: string;
    setup: () => void;
    expectedError: string;
  }>,
) {
  return errorScenarios.map(scenario => ({
    name: scenario.name,
    test: async () => {
      scenario.setup();
      await expect(emailFunction(baseData)).rejects.toThrow(scenario.expectedError);
    },
  }));
}

/**
 * Generates edge case test scenarios
 */
export function generateEdgeCaseTestScenarios<T>(
  emailFunction: (data: T) => Promise<any>,
  baseData: T,
  edgeCases: Array<{
    name: string;
    data: Partial<T>;
    expectation: (result: any) => void;
  }>,
) {
  return edgeCases.map(edgeCase => ({
    name: edgeCase.name,
    test: async () => {
      const testData = { ...baseData, ...edgeCase.data };
      const result = await emailFunction(testData);
      edgeCase.expectation(result);
    },
  }));
}

// ============================================================================
// PROPERTY TRANSFORMATION HELPERS
// ============================================================================

/**
 * Transforms email data to different formats for testing
 */
export function transformEmailData(emailData: any) {
  return {
    withNullName: { ...emailData, name: null },
    withEmptyName: { ...emailData, name: '' },
    withUndefinedName: { ...emailData, name: undefined },
    withLongName: { ...emailData, name: 'A'.repeat(100) },
    withSpecialChars: { ...emailData, name: 'Test User!@#$%' },
    withUnicodeChars: { ...emailData, name: 'Test User 中文' },
  };
}

/**
 * Creates invalid email variations for negative testing
 */
export function createInvalidEmailVariations<T>(baseData: T) {
  return {
    invalidEmail: { ...baseData, email: 'invalid-email' },
    emptyEmail: { ...baseData, email: '' },
    nullEmail: { ...baseData, email: null },
    undefinedEmail: { ...baseData, email: undefined },
    longEmail: { ...baseData, email: 'a'.repeat(100) + '@example.com' },
    specialCharsEmail: { ...baseData, email: 'test+special@example.com' },
  };
}

/**
 * Creates missing property variations for testing
 */
export function createMissingPropertyVariations<T>(baseData: T, requiredProps: Array<keyof T>) {
  return requiredProps.reduce((acc, prop) => {
    const variant = { ...baseData };
    delete variant[prop];
    return { ...acc, [`missing_${String(prop)}`]: variant };
  }, {});
}

// ============================================================================
// PERFORMANCE TEST HELPERS
// ============================================================================

/**
 * Measures execution time of email operations
 */
export async function measureEmailExecutionTime<T>(
  operation: () => T | Promise<T>,
  iterations: number = 100,
): Promise<{ result: T; averageTime: number; totalTime: number }> {
  const start = performance.now();
  let result!: T;

  for (let i = 0; i < iterations; i++) {
    result = await operation();
  }

  const end = performance.now();
  const totalTime = end - start;
  const averageTime = totalTime / iterations;

  return {
    result,
    averageTime,
    totalTime,
  };
}

/**
 * Validates email performance benchmarks
 */
export function validateEmailPerformance(
  averageTime: number,
  maxAllowedTime: number = 10, // 10ms default for email operations
  operation: string = 'email operation',
) {
  expect(averageTime).toBeLessThan(maxAllowedTime);

  if (averageTime > maxAllowedTime * 0.8) {
    console.warn(
      `Performance warning: ${operation} took ${averageTime.toFixed(2)}ms (threshold: ${maxAllowedTime}ms)`,
    );
  }
}

// ============================================================================
// TEMPLATE TESTING UTILITIES
// ============================================================================

/**
 * Tests template across different prop scenarios
 */
export function testTemplateAcrossScenarios<T>(
  templateFunction: (props: T) => any,
  scenarios: Array<{
    name: string;
    props: T;
    expectedBehavior: string;
  }>,
) {
  scenarios.forEach(scenario => {
    test(`should ${scenario.expectedBehavior}`, () => {
      expect(() => templateFunction(scenario.props)).not.toThrow();
    });
  });
}

/**
 * Tests email sending function across different scenarios
 */
export function testEmailSendingAcrossScenarios<T>(
  emailFunction: (data: T) => Promise<any>,
  scenarios: Array<{
    name: string;
    data: T;
    expectedResult: any;
  }>,
) {
  scenarios.forEach(scenario => {
    test(`should ${scenario.name}`, async () => {
      const result = await emailFunction(scenario.data);
      expect(result).toEqual(scenario.expectedResult);
    });
  });
}

/**
 * Creates test utilities for email template testing
 */
export function createTemplateTestUtils() {
  return {
    expectTemplateToRender: (templateFunction: any, props: any) => {
      expect(() => templateFunction(props)).not.toThrow();
    },

    expectTemplateToHaveProps: (templateFunction: any, props: any, expectedProps: string[]) => {
      const result = templateFunction(props);
      expectedProps.forEach(prop => {
        expect(result).toContain(prop);
      });
    },

    expectTemplateToHandleEdgeCases: (templateFunction: any, edgeCaseProps: any) => {
      expect(() => templateFunction(edgeCaseProps)).not.toThrow();
    },
  };
}

/**
 * Creates test utilities for email sending testing
 */
export function createEmailSendingTestUtils() {
  return {
    expectEmailToBeSent: (mockSend: any, expectedParams: any) => {
      expect(mockSend).toHaveBeenCalledWith(expectedParams);
    },

    expectEmailToBeRendered: (mockRender: any, expectedTemplate: any) => {
      expect(mockRender).toHaveBeenCalledWith(expectedTemplate);
    },

    expectEmailToReturnResult: (result: any, expectedResult: any) => {
      expect(result).toEqual(expectedResult);
    },
  };
}
