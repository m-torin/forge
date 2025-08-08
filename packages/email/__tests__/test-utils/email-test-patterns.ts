/**
 * Email Test Patterns and Utilities
 *
 * Reusable test patterns for email functionality testing.
 * Provides consistent testing approaches across all email test files.
 */

import { expect, vi } from 'vitest';

// ============================================================================
// CORE EMAIL TEST PATTERNS
// ============================================================================

/**
 * Standard pattern for testing email sending functions
 */
export function testEmailSendingFunction<T>(
  functionName: string,
  emailFunction: (data: T) => Promise<any>,
  baseData: T,
  scenarios: Array<{
    name: string;
    data?: Partial<T>;
    setup?: () => void;
    expectedResult?: any;
    expectedError?: string;
    customAssertions?: (result: any) => void;
  }>,
) {
  scenarios.forEach(scenario => {
    test(`should ${scenario.name}`, async () => {
      if (scenario.setup) {
        scenario.setup();
      }

      const testData = { ...baseData, ...scenario.data };

      if (scenario.expectedError) {
        await expect(emailFunction(testData)).rejects.toThrow(scenario.expectedError);
      } else {
        const result = await emailFunction(testData);

        if (scenario.expectedResult) {
          expect(result).toStrictEqual(scenario.expectedResult);
        }

        if (scenario.customAssertions) {
          scenario.customAssertions(result);
        }
      }
    });
  });
}

/**
 * Pattern for testing email templates
 */
export function testEmailTemplate<T>(
  templateName: string,
  templateFunction: (props: T) => any,
  scenarios: Array<{
    name: string;
    props: T;
    shouldNotThrow?: boolean;
    customAssertions?: (result: any) => void;
  }>,
) {
  scenarios.forEach(scenario => {
    test(`should ${scenario.name}`, () => {
      if (scenario.shouldNotThrow !== false) {
        expect(() => templateFunction(scenario.props)).not.toThrow();
      } else {
        expect(() => templateFunction(scenario.props)).toThrow();
      }

      if (scenario.customAssertions) {
        const result = templateFunction(scenario.props);
        scenario.customAssertions(result);
      }
    });
  });
}

/**
 * Pattern for testing email service integration
 */
export function testEmailServiceIntegration(
  scenarios: Array<{
    name: string;
    serviceType: string;
    setup: () => any;
    operation: () => Promise<any>;
    expectedResult: any;
    customAssertions?: (result: any) => void;
  }>,
) {
  describe('email service integration', () => {
    scenarios.forEach(scenario => {
      test(`should handle ${scenario.name}`, async () => {
        scenario.setup();

        const result = await scenario.operation();

        if (scenario.expectedResult !== null) {
          expect(result).toBeDefined();
        }

        if (scenario.customAssertions) {
          scenario.customAssertions(result);
        }
      });
    });
  });
}

/**
 * Pattern for testing email validation
 */
export function testEmailValidation(
  validationConfigs: Array<{
    name: string;
    validationFunction: (data: any) => { isValid: boolean; errors: string[] };
    testCases: Array<{
      name: string;
      data: any;
      expectedValid: boolean;
    }>;
  }>,
) {
  describe('email validation', () => {
    validationConfigs.forEach(config => {
      describe(config.name, () => {
        config.testCases.forEach(testCase => {
          test(`should ${testCase.expectedValid ? 'accept' : 'reject'} ${testCase.name}`, () => {
            const result = config.validationFunction(testCase.data);
            expect(result.isValid).toBe(testCase.expectedValid);
          });
        });
      });
    });
  });
}

// ============================================================================
// MOCK CREATION PATTERNS
// ============================================================================

/**
 * Creates a standardized mock for Resend service
 */
export function createStandardResendMock(overrides: any = {}) {
  return {
    emails: {
      send: vi.fn().mockResolvedValue({
        data: { id: 'email_123' },
        error: null,
      }),
      create: vi.fn().mockResolvedValue({
        data: { id: 'email_123' },
        error: null,
      }),
      ...overrides.emails,
    },
    ...overrides,
  };
}

/**
 * Creates a standardized mock for React Email render
 */
export function createStandardRenderMock(overrides: any = {}) {
  return vi.fn().mockResolvedValue('<html>Mock rendered email</html>');
}

/**
 * Creates a standardized mock for environment variables
 */
export function createStandardEnvMock(overrides: any = {}) {
  return vi.fn().mockReturnValue({
    RESEND_FROM: 'noreply@example.com',
    RESEND_TOKEN: 're_123456789',
    ...overrides,
  });
}

/**
 * Creates a standardized mock for email templates
 */
export function createStandardTemplateMocks() {
  return {
    MagicLinkTemplate: vi
      .fn()
      .mockImplementation(props => `MagicLinkTemplate:${JSON.stringify(props)}`),
    VerificationTemplate: vi
      .fn()
      .mockImplementation(props => `VerificationTemplate:${JSON.stringify(props)}`),
    PasswordResetTemplate: vi
      .fn()
      .mockImplementation(props => `PasswordResetTemplate:${JSON.stringify(props)}`),
    ContactTemplate: vi
      .fn()
      .mockImplementation(props => `ContactTemplate:${JSON.stringify(props)}`),
    OrganizationInvitationTemplate: vi
      .fn()
      .mockImplementation(props => `OrganizationInvitationTemplate:${JSON.stringify(props)}`),
    WelcomeTemplate: vi
      .fn()
      .mockImplementation(props => `WelcomeTemplate:${JSON.stringify(props)}`),
    ApiKeyCreatedTemplate: vi
      .fn()
      .mockImplementation(props => `ApiKeyCreatedTemplate:${JSON.stringify(props)}`),
  };
}

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Validates email sending workflow
 */
export function validateEmailSendingWorkflow(
  mockRender: any,
  mockResendSend: any,
  expectedTemplateCall: any,
  expectedSendCall: any,
) {
  expect(mockRender).toHaveBeenCalledWith(expectedTemplateCall);
  expect(mockResendSend).toHaveBeenCalledWith(expectedSendCall);
}

/**
 * Validates email template rendering
 */
export function validateEmailTemplateRendering(mockTemplate: any, expectedProps: any) {
  expect(mockTemplate).toHaveBeenCalledWith(expectedProps);
}

/**
 * Validates email service response
 */
export function validateEmailServiceResponse(
  result: any,
  expectedResponse: any = { data: { id: 'email_123' }, error: null },
) {
  expect(result).toStrictEqual(expectedResponse);
}

/**
 * Validates email parameters
 */
export function validateEmailParameters(
  emailParams: any,
  expectedParams: {
    from: string;
    to: string;
    subject: string;
    html?: string;
  },
) {
  expect(emailParams.from).toBe(expectedParams.from);
  expect(emailParams.to).toBe(expectedParams.to);
  expect(emailParams.subject).toBe(expectedParams.subject);

  if (expectedParams.html) {
    expect(emailParams.html).toBe(expectedParams.html);
  }
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Asserts that email function handles default values correctly
 */
export function assertEmailFunctionDefaults<T>(
  emailFunction: (data: T) => Promise<any>,
  baseData: T,
  defaultAssertions: Array<{
    field: keyof T;
    expectedDefault: any;
    mockValidation: (mockCall: any) => void;
  }>,
) {
  defaultAssertions.forEach(assertion => {
    test(`should use default ${String(assertion.field)} when not provided`, async () => {
      const dataWithoutField = { ...baseData };
      delete dataWithoutField[assertion.field];

      await emailFunction(dataWithoutField);

      assertion.mockValidation(assertion.expectedDefault);
    });
  });
}

/**
 * Asserts that email function handles errors gracefully
 */
export function assertEmailFunctionErrorHandling<T>(
  emailFunction: (data: T) => Promise<any>,
  baseData: T,
  errorScenarios: Array<{
    name: string;
    setup: () => void;
    expectedError: string;
  }>,
) {
  errorScenarios.forEach(scenario => {
    test(`should handle ${scenario.name} gracefully`, async () => {
      scenario.setup();

      await expect(emailFunction(baseData)).rejects.toThrow(scenario.expectedError);
    });
  });
}

/**
 * Asserts that email templates handle edge cases
 */
export function assertEmailTemplateEdgeCases<T>(
  templateFunction: (props: T) => any,
  edgeCases: Array<{
    name: string;
    props: T;
    expectedBehavior: string;
  }>,
) {
  edgeCases.forEach(edgeCase => {
    test(`should ${edgeCase.expectedBehavior}`, () => {
      expect(() => templateFunction(edgeCase.props)).not.toThrow();
    });
  });
}

// ============================================================================
// PERFORMANCE TESTING PATTERNS
// ============================================================================

/**
 * Measures email operation performance
 */
export function measureEmailOperationPerformance<T>(
  operation: () => T | Promise<T>,
  maxDuration: number = 100, // 100ms default
  iterations: number = 10,
): Promise<{ result: T; averageTime: number; totalTime: number }> {
  return new Promise(async resolve => {
    const start = performance.now();
    let result!: T;

    for (let i = 0; i < iterations; i++) {
      result = await operation();
    }

    const end = performance.now();
    const totalTime = end - start;
    const averageTime = totalTime / iterations;

    expect(averageTime).toBeLessThan(maxDuration);

    resolve({ result, averageTime, totalTime });
  });
}

/**
 * Tests email template performance
 */
export function testEmailTemplatePerformance<T>(
  templateFunction: (props: T) => any,
  props: T,
  maxRenderTime: number = 10, // 10ms default
) {
  test('should render template quickly', async () => {
    await measureEmailOperationPerformance(
      () => templateFunction(props),
      maxRenderTime,
      50, // Lower iterations for template rendering
    );
  });
}

/**
 * Tests email sending performance
 */
export function testEmailSendingPerformance<T>(
  emailFunction: (data: T) => Promise<any>,
  emailData: T,
  maxSendTime: number = 50, // 50ms default
) {
  test('should send email quickly', async () => {
    await measureEmailOperationPerformance(
      () => emailFunction(emailData),
      maxSendTime,
      10, // Lower iterations for email sending
    );
  });
}

// ============================================================================
// BULK TESTING UTILITIES
// ============================================================================

/**
 * Tests multiple email templates with the same pattern
 */
export function testEmailTemplatesBulk<T>(
  templates: Array<{
    name: string;
    templateFunction: (props: T) => any;
    testProps: T;
  }>,
  testPattern: (templateFunction: (props: T) => any, props: T) => void,
) {
  templates.forEach(template => {
    describe(`${template.name} template`, () => {
      testPattern(template.templateFunction, template.testProps);
    });
  });
}

/**
 * Tests multiple email sending functions with the same pattern
 */
export function testEmailSendingFunctionsBulk<T>(
  functions: Array<{
    name: string;
    emailFunction: (data: T) => Promise<any>;
    testData: T;
  }>,
  testPattern: (emailFunction: (data: T) => Promise<any>, data: T) => void,
) {
  functions.forEach(func => {
    describe(`${func.name} function`, () => {
      testPattern(func.emailFunction, func.testData);
    });
  });
}

// ============================================================================
// ERROR SCENARIO GENERATORS
// ============================================================================

/**
 * Generates common error scenarios for email testing
 */
export function generateEmailErrorScenarios() {
  return [
    {
      name: 'template rendering failure',
      setup: () => {
        // Mock will be configured by caller
      },
      expectedError: 'Failed to send',
    },
    {
      name: 'email service failure',
      setup: () => {
        // Mock will be configured by caller
      },
      expectedError: 'Failed to send',
    },
    {
      name: 'network error',
      setup: () => {
        // Mock will be configured by caller
      },
      expectedError: 'Network error',
    },
    {
      name: 'authentication error',
      setup: () => {
        // Mock will be configured by caller
      },
      expectedError: 'Authentication failed',
    },
  ];
}

/**
 * Generates edge case scenarios for email testing
 */
export function generateEmailEdgeCaseScenarios() {
  return [
    {
      name: 'empty string values',
      modifications: { name: '', subject: '' },
      expectedBehavior: 'handle empty strings gracefully',
    },
    {
      name: 'null values',
      modifications: { name: null },
      expectedBehavior: 'handle null values gracefully',
    },
    {
      name: 'undefined values',
      modifications: { name: undefined },
      expectedBehavior: 'handle undefined values gracefully',
    },
    {
      name: 'very long strings',
      modifications: { name: 'A'.repeat(1000) },
      expectedBehavior: 'handle very long strings gracefully',
    },
    {
      name: 'special characters',
      modifications: { name: 'Test!@#$%^&*()' },
      expectedBehavior: 'handle special characters gracefully',
    },
    {
      name: 'unicode characters',
      modifications: { name: 'Test 中文 🎉' },
      expectedBehavior: 'handle unicode characters gracefully',
    },
  ];
}

// ============================================================================
// BULK TEST PATTERN FUNCTIONS (MISSING FROM ORIGINAL)
// ============================================================================

/**
 * Tests module exports - validates that all expected exports are available
 */
export function testModuleExports(
  moduleName: string,
  importPath: string,
  expectedExports: Array<{ name: string; type: string }>,
) {
  describe(`${moduleName} exports`, () => {
    test('should export all required functions and objects', async () => {
      const module = await import(importPath);

      expectedExports.forEach(exportInfo => {
        expect(typeof module[exportInfo.name]).toBe(exportInfo.type);
      });
    });
  });
}

/**
 * Tests email sending functions with various scenarios
 */
export function testEmailSendingFunctions(
  functionConfigs: Array<{
    name: string;
    functionName: string;
    testData: any;
    expectedSubject: string;
    defaultValues?: any;
  }>,
) {
  describe('email sending functions', () => {
    functionConfigs.forEach(config => {
      test(`should have ${config.functionName} function`, async () => {
        const module = await import('../../src/index');
        expect(typeof (module as any)[config.functionName]).toBe('function');
      });
    });
  });
}

/**
 * Tests email templates
 */
export function testEmailTemplates(
  templateConfigs: Array<{
    name: string;
    templateName: string;
    importPath: string;
    requiredProps: any;
    minimumProps?: any;
    edgeCases?: Array<{
      name: string;
      props: any;
      expectedBehavior: string;
    }>;
  }>,
) {
  describe('email templates', () => {
    templateConfigs.forEach(config => {
      describe(config.name, () => {
        test(`should have ${config.templateName} function`, async () => {
          const module = await import(config.importPath);
          expect(typeof module[config.templateName]).toBe('function');
        });

        if (config.edgeCases) {
          config.edgeCases.forEach(edgeCase => {
            test(`should ${edgeCase.expectedBehavior}`, async () => {
              const module = await import(config.importPath);
              const template = module[config.templateName];
              expect(() => template(edgeCase.props)).not.toThrow();
            });
          });
        }
      });
    });
  });
}

/**
 * Tests error handling patterns
 */
export function testEmailErrorHandling(
  scenarios: Array<{
    name: string;
    errorType: string;
    setup: () => any;
    operation: () => Promise<any>;
    expectedError?: string;
    expectedFallback?: any;
  }>,
) {
  describe('error handling patterns', () => {
    scenarios.forEach(scenario => {
      test(`should handle ${scenario.name}`, async () => {
        scenario.setup();

        if (scenario.expectedError && !scenario.expectedFallback) {
          await expect(scenario.operation()).rejects.toThrow();
        } else {
          const result = await scenario.operation();
          expect(result).toBeDefined();
        }
      });
    });
  });
}

/**
 * Tests performance patterns
 */
export function testEmailPerformance(
  scenarios: Array<{
    name: string;
    operation: () => Promise<any>;
    maxDuration: number;
    iterations?: number;
  }>,
) {
  describe('performance patterns', () => {
    scenarios.forEach(scenario => {
      test(`should ${scenario.name} within performance limits`, async () => {
        const start = performance.now();

        const iterations = scenario.iterations || 1;
        for (let i = 0; i < iterations; i++) {
          await scenario.operation();
        }

        const duration = (performance.now() - start) / iterations;
        expect(duration).toBeLessThan(scenario.maxDuration);
      });
    });
  });
}

// ============================================================================
// INTEGRATION TESTING PATTERNS
// ============================================================================

/**
 * Tests email workflow integration
 */
export function testEmailWorkflowIntegration<T>(
  workflowName: string,
  emailFunction: (data: T) => Promise<any>,
  templateFunction: (props: any) => any,
  emailData: T,
  expectedWorkflow: {
    templateCall: any;
    sendCall: any;
    result: any;
  },
) {
  test(`should execute ${workflowName} workflow correctly`, async () => {
    const result = await emailFunction(emailData);

    expect(result).toStrictEqual(expectedWorkflow.result);
  });
}

/**
 * Tests email service integration
 */
export function testEmailServiceIntegrationPattern(
  serviceName: string,
  serviceConfigurations: Array<{
    name: string;
    config: any;
    expectedBehavior: string;
    test: () => Promise<void>;
  }>,
) {
  describe(`${serviceName} service integration`, () => {
    serviceConfigurations.forEach(config => {
      test(`should ${config.expectedBehavior} with ${config.name}`, async () => {
        await config.test();
      });
    });
  });
}

/**
 * Tests email template consistency across different data
 */
export function testEmailTemplateConsistency<T>(
  templateFunction: (props: T) => any,
  testDataSets: Array<{
    name: string;
    data: T;
    expectedConsistency: (result: any) => void;
  }>,
) {
  testDataSets.forEach(dataSet => {
    test(`should maintain consistency with ${dataSet.name}`, () => {
      const result = templateFunction(dataSet.data);
      dataSet.expectedConsistency(result);
    });
  });
}
