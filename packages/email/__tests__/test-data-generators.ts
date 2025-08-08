/**
 * Test Data Generators for Email Package
 *
 * Comprehensive test data generators for all email functionality,
 * following the analytics package pattern for consistent testing.
 */

// Mock faker functions for testing without external dependency
const mockFaker = {
  internet: {
    email: () => 'test@example.com',
    userName: () => 'testuser',
    domainName: () => 'example.com',
    port: () => 3000,
  },
  person: {
    firstName: () => 'John',
    lastName: () => 'Doe',
    fullName: () => 'John Doe',
    prefix: () => 'Mr.',
    suffix: () => 'Jr.',
  },
  company: {
    name: () => 'Test Company',
    buzzAdjective: () => 'innovative',
    buzzNoun: () => 'solution',
    buzzVerb: () => 'deliver',
  },
  lorem: {
    sentence: () => 'This is a test sentence.',
    paragraph: () => 'This is a test paragraph with some content.',
    paragraphs: (count: number) => Array(count).fill('This is a test paragraph.').join('\n\n'),
    word: () => 'test',
    words: (count: number) => Array(count).fill('test').join(' '),
    slug: () => 'test-slug',
  },
  string: {
    alphanumeric: (length: number) => 'a'.repeat(length),
    numeric: (length: number) => '1'.repeat(length),
  },
  number: {
    int: (options: any) => options?.min || 1,
  },
  helpers: {
    arrayElement: (arr: any[]) => arr[0] || 'test',
  },
  seed: (value?: any) => {},
};

const faker = mockFaker;

// ================================================================================================
// CORE EMAIL DATA GENERATORS
// ================================================================================================

/**
 * Generates realistic email addresses for testing
 */
export const generateEmailAddress = {
  valid: () => faker.internet.email(),
  validWithName: () =>
    `${faker.person.firstName().toLowerCase()}.${faker.person.lastName().toLowerCase()}@${faker.internet.domainName()}`,
  corporate: () =>
    `${faker.person.firstName().toLowerCase()}@${faker.company.name().toLowerCase().replace(/\s+/g, '')}.com`,
  gmail: () => `${faker.internet.userName()}@gmail.com`,
  outlook: () => `${faker.internet.userName()}@outlook.com`,
  yahoo: () => `${faker.internet.userName()}@yahoo.com`,

  // Edge cases
  withPlus: () => `${faker.internet.userName()}+tag@${faker.internet.domainName()}`,
  withDots: () =>
    `${faker.internet.userName().replace(/[^a-z0-9]/gi, '.')}.test@${faker.internet.domainName()}`,
  longLocal: () => `${'a'.repeat(50)}@${faker.internet.domainName()}`,
  longDomain: () => `${faker.internet.userName()}@${'subdomain.'.repeat(10)}example.com`,

  // Invalid formats for negative testing
  invalid: {
    noAt: () => faker.internet.userName() + faker.internet.domainName(),
    noDomain: () => faker.internet.userName() + '@',
    noLocal: () => '@' + faker.internet.domainName(),
    doubleAt: () => `${faker.internet.userName()}@@${faker.internet.domainName()}`,
    spacesInLocal: () => `${faker.internet.userName()} space@${faker.internet.domainName()}`,
    invalidChars: () => `${faker.internet.userName()}[]@${faker.internet.domainName()}`,
  },
};

/**
 * Generates user names for testing
 */
export const generateUserName = {
  full: () => faker.person.fullName(),
  first: () => faker.person.firstName(),
  last: () => faker.person.lastName(),
  withTitle: () => `${faker.person.prefix()} ${faker.person.fullName()}`,
  withSuffix: () => `${faker.person.fullName()} ${faker.person.suffix()}`,

  // Edge cases
  empty: () => '',
  null: () => null,
  undefined: () => undefined,
  singleChar: () => 'J',
  veryLong: () => faker.lorem.words(20),
  withNumbers: () => `${faker.person.firstName()}${faker.number.int({ min: 1, max: 999 })}`,
  withSpecialChars: () => `${faker.person.firstName()}!@#$%`,
  unicode: () => `${faker.person.firstName()} 中文 🎉`,

  // Common variations
  lowercase: () => faker.person.fullName().toLowerCase(),
  uppercase: () => faker.person.fullName().toUpperCase(),
  mixedCase: () =>
    faker.person
      .fullName()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
};

/**
 * Generates URLs for testing
 */
export const generateUrls = {
  https: () => `https://${faker.internet.domainName()}`,
  http: () => `http://${faker.internet.domainName()}`,
  withPath: () => `https://${faker.internet.domainName()}/${faker.lorem.slug()}`,
  withQuery: () =>
    `https://${faker.internet.domainName()}/?${faker.lorem.slug()}=${faker.lorem.word()}`,
  withFragment: () => `https://${faker.internet.domainName()}#${faker.lorem.slug()}`,

  // Specific email contexts
  magicLink: () => `https://app.example.com/magic-link?token=${faker.string.alphanumeric(32)}`,
  verificationLink: () =>
    `https://app.example.com/verify-email?token=${faker.string.alphanumeric(32)}`,
  resetLink: () => `https://app.example.com/reset-password?token=${faker.string.alphanumeric(32)}`,
  inviteLink: () => `https://app.example.com/invite?token=${faker.string.alphanumeric(32)}`,
  dashboardUrl: () => `https://app.example.com/dashboard`,
  apiKeysUrl: () => `https://app.example.com/settings/api-keys`,

  // Edge cases
  veryLong: () => `https://example.com/${'path/'.repeat(50)}endpoint`,
  withSpecialChars: () => `https://example.com/path with spaces & special chars`,
  withUnicode: () => `https://example.com/路径/测试`,
  localhost: () => `http://localhost:${faker.internet.port()}`,

  // Invalid URLs for negative testing
  invalid: {
    noProtocol: () => `example.com/path`,
    invalidProtocol: () => `ftp://example.com/path`,
    noHost: () => `https:///path`,
    spaces: () => `https://example .com/path`,
    malformed: () => `https://example..com/path`,
  },
};

/**
 * Generates time-related data for testing
 */
export const generateTimeData = {
  expiresIn: {
    minutes: () => `${faker.number.int({ min: 1, max: 60 })} minutes`,
    hours: () => `${faker.number.int({ min: 1, max: 24 })} hours`,
    days: () => `${faker.number.int({ min: 1, max: 7 })} days`,
    common: () =>
      faker.helpers.arrayElement([
        '15 minutes',
        '30 minutes',
        '1 hour',
        '24 hours',
        '48 hours',
        '72 hours',
      ]),
  },

  // Edge cases
  veryShort: () => '1 minute',
  veryLong: () => '365 days',
  zero: () => '0 minutes',
  invalid: () => 'invalid time',
};

/**
 * Generates organization data for testing
 */
export const generateOrganizationData = {
  name: () => faker.company.name(),
  shortName: () => faker.company.buzzAdjective(),
  longName: () => `${faker.company.name()} ${faker.company.buzzNoun()} ${faker.company.buzzVerb()}`,

  // Common organization types
  startup: () => `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()}`,
  enterprise: () => `${faker.company.name()} Corporation`,
  nonprofit: () => `${faker.company.buzzAdjective()} Foundation`,

  // Edge cases
  singleWord: () => faker.company.buzzNoun(),
  withNumbers: () => `${faker.company.name()} ${faker.number.int({ min: 1, max: 999 })}`,
  withSpecialChars: () => `${faker.company.name()} & Co.`,
  unicode: () => `${faker.company.name()} 中文公司`,
};

/**
 * Generates API key data for testing
 */
export const generateApiKeyData = {
  id: () => `ak_${faker.string.alphanumeric(16)}`,
  name: () =>
    faker.helpers.arrayElement([
      'Production API Key',
      'Development Key',
      'Test API Key',
      'Integration Key',
      'Staging Key',
      'Mobile App Key',
      'Web App Key',
      'Analytics Key',
      'Webhook Key',
      'Admin Key',
    ]),

  // Edge cases
  shortName: () => 'Key',
  longName: () => faker.lorem.words(10),
  withNumbers: () => `API Key ${faker.number.int({ min: 1, max: 999 })}`,
  withSpecialChars: () => `API Key (${faker.lorem.word()})`,
  unicode: () => `API密钥 ${faker.lorem.word()}`,
};

/**
 * Generates message content for testing
 */
export const generateMessageContent = {
  short: () => faker.lorem.sentence(),
  medium: () => faker.lorem.paragraph(),
  long: () => faker.lorem.paragraphs(3),

  // Contact form specific
  contactInquiry: () =>
    `Hello, I'm interested in ${faker.lorem.words(3)}. Could you please provide more information about ${faker.lorem.words(5)}?`,
  supportRequest: () =>
    `I'm experiencing an issue with ${faker.lorem.words(3)}. The error message is: ${faker.lorem.sentence()}`,
  feedback: () =>
    `I wanted to share some feedback about ${faker.lorem.words(3)}. Overall, ${faker.lorem.sentence()}`,

  // Edge cases
  empty: () => '',
  singleWord: () => faker.lorem.word(),
  veryLong: () => faker.lorem.paragraphs(20),
  withHtml: () => `<p>${faker.lorem.sentence()}</p><strong>${faker.lorem.words(3)}</strong>`,
  withSpecialChars: () => `${faker.lorem.sentence()} !@#$%^&*()`,
  unicode: () => `${faker.lorem.sentence()} 中文内容 🎉`,

  // Code snippets for technical support
  withCode: () =>
    `${faker.lorem.sentence()}

\`\`\`javascript
console.log('${faker.lorem.words(3)}');
\`\`\``,
  withStackTrace: () =>
    `${faker.lorem.sentence()}

Error: ${faker.lorem.words(3)}
  at ${faker.lorem.words(2)} (file.js:${faker.number.int({ min: 1, max: 100 })}:${faker.number.int({ min: 1, max: 50 })})`,
};

/**
 * Generates OTP codes for testing
 */
export const generateOtpData = {
  sixDigit: () => faker.string.numeric(6),
  fourDigit: () => faker.string.numeric(4),
  eightDigit: () => faker.string.numeric(8),

  // Different purposes
  purpose: {
    login: () => 'login verification',
    registration: () => 'account registration',
    passwordReset: () => 'password reset',
    twoFactor: () => 'two-factor authentication',
    phoneVerification: () => 'phone number verification',
    emailVerification: () => 'email verification',
    accountRecovery: () => 'account recovery',
    securityCheck: () => 'security verification',
  },

  // Edge cases
  allZeros: () => '000000',
  allNines: () => '999999',
  sequential: () => '123456',
  repeated: () => '111111',

  // Invalid for negative testing
  invalid: {
    empty: () => '',
    tooShort: () => faker.string.numeric(3),
    tooLong: () => faker.string.numeric(12),
    withLetters: () => `${faker.string.numeric(3)}ABC`,
    withSymbols: () => `${faker.string.numeric(3)}!@#`,
  },
};

// ================================================================================================
// COMPOSITE DATA GENERATORS
// ================================================================================================

/**
 * Generates complete email data sets for different email types
 */
export const generateCompleteEmailData = {
  magicLink: (overrides: any = {}) => ({
    email: generateEmailAddress.valid(),
    name: generateUserName.full(),
    expiresIn: generateTimeData.expiresIn.common(),
    magicLink: generateUrls.magicLink(),
    ...overrides,
  }),

  verification: (overrides: any = {}) => ({
    email: generateEmailAddress.valid(),
    name: generateUserName.full(),
    verificationLink: generateUrls.verificationLink(),
    ...overrides,
  }),

  passwordReset: (overrides: any = {}) => ({
    email: generateEmailAddress.valid(),
    name: generateUserName.full(),
    resetLink: generateUrls.resetLink(),
    ...overrides,
  }),

  otp: (overrides: any = {}) => ({
    email: generateEmailAddress.valid(),
    name: generateUserName.full(),
    otp: generateOtpData.sixDigit(),
    purpose: generateOtpData.purpose.login(),
    ...overrides,
  }),

  contact: (overrides: any = {}) => ({
    email: generateEmailAddress.valid(),
    name: generateUserName.full(),
    message: generateMessageContent.contactInquiry(),
    to: generateEmailAddress.corporate(),
    ...overrides,
  }),

  organizationInvitation: (overrides: any = {}) => ({
    email: generateEmailAddress.valid(),
    expiresIn: generateTimeData.expiresIn.hours(),
    inviteLink: generateUrls.inviteLink(),
    inviterEmail: generateEmailAddress.corporate(),
    inviterName: generateUserName.full(),
    organizationName: generateOrganizationData.name(),
    ...overrides,
  }),

  welcome: (overrides: any = {}) => ({
    email: generateEmailAddress.valid(),
    name: generateUserName.full(),
    dashboardUrl: generateUrls.dashboardUrl(),
    organizationName: generateOrganizationData.name(),
    ...overrides,
  }),

  apiKeyCreated: (overrides: any = {}) => ({
    email: generateEmailAddress.valid(),
    name: generateUserName.full(),
    apiKeyId: generateApiKeyData.id(),
    apiKeyName: generateApiKeyData.name(),
    dashboardUrl: generateUrls.apiKeysUrl(),
    ...overrides,
  }),
};

/**
 * Generates test scenarios for different email types
 */
export const generateTestScenarios = {
  /**
   * Generates edge case scenarios for any email type
   */
  edgeCases: (baseData: any) => [
    {
      name: 'with null name',
      data: { ...baseData, name: null },
      expectedBehavior: 'handle null name gracefully',
    },
    {
      name: 'with empty name',
      data: { ...baseData, name: '' },
      expectedBehavior: 'handle empty name gracefully',
    },
    {
      name: 'with very long name',
      data: { ...baseData, name: generateUserName.veryLong() },
      expectedBehavior: 'handle very long name gracefully',
    },
    {
      name: 'with special characters in name',
      data: { ...baseData, name: generateUserName.withSpecialChars() },
      expectedBehavior: 'handle special characters gracefully',
    },
    {
      name: 'with unicode characters',
      data: { ...baseData, name: generateUserName.unicode() },
      expectedBehavior: 'handle unicode characters gracefully',
    },
    {
      name: 'with plus sign in email',
      data: { ...baseData, email: generateEmailAddress.withPlus() },
      expectedBehavior: 'handle plus sign in email gracefully',
    },
    {
      name: 'with dots in email',
      data: { ...baseData, email: generateEmailAddress.withDots() },
      expectedBehavior: 'handle dots in email gracefully',
    },
  ],

  /**
   * Generates error scenarios for email testing
   */
  errorScenarios: () => [
    {
      name: 'invalid email format',
      data: { email: generateEmailAddress.invalid.noAt() },
      expectedError: 'Invalid email format',
    },
    {
      name: 'missing required field',
      data: { email: '' },
      expectedError: 'Missing required field',
    },
    {
      name: 'template rendering failure',
      setup: () => {
        // Mock setup will be handled by test implementation
      },
      expectedError: 'Template rendering failed',
    },
    {
      name: 'email service failure',
      setup: () => {
        // Mock setup will be handled by test implementation
      },
      expectedError: 'Email service failed',
    },
    {
      name: 'network timeout',
      setup: () => {
        // Mock setup will be handled by test implementation
      },
      expectedError: 'Network timeout',
    },
  ],

  /**
   * Generates performance test scenarios
   */
  performanceScenarios: () => [
    {
      name: 'render template quickly',
      operation: 'template rendering',
      maxDuration: 10, // 10ms
      iterations: 100,
    },
    {
      name: 'send email quickly',
      operation: 'email sending',
      maxDuration: 50, // 50ms
      iterations: 20,
    },
    {
      name: 'batch email processing',
      operation: 'batch processing',
      maxDuration: 200, // 200ms
      iterations: 5,
    },
  ],

  /**
   * Generates validation test scenarios
   */
  validationScenarios: (requiredFields: string[]) => [
    ...requiredFields.map(field => ({
      name: `missing ${field}`,
      data: { [field]: undefined },
      expectedValid: false,
      expectedError: `Missing required field: ${field}`,
    })),
    {
      name: 'all required fields present',
      data: requiredFields.reduce(
        (acc, field) => ({
          ...acc,
          [field]: field === 'email' ? generateEmailAddress.valid() : faker.lorem.word(),
        }),
        {},
      ),
      expectedValid: true,
    },
    {
      name: 'invalid email format',
      data: { email: generateEmailAddress.invalid.noAt() },
      expectedValid: false,
      expectedError: 'Invalid email format',
    },
    {
      name: 'very long field values',
      data: requiredFields.reduce(
        (acc, field) => ({
          ...acc,
          [field]: field === 'email' ? generateEmailAddress.valid() : 'a'.repeat(1000),
        }),
        {},
      ),
      expectedValid: true, // Should handle long values gracefully
    },
  ],
};

/**
 * Generates mock API responses for testing
 */
export const generateMockResponses = {
  resend: {
    success: () => ({
      data: { id: `email_${faker.string.alphanumeric(16)}` },
      error: null,
    }),

    error: (errorMessage?: string) => ({
      data: null,
      error: {
        message: errorMessage || faker.lorem.sentence(),
        name: 'ResendError',
      },
    }),

    rateLimited: () => ({
      data: null,
      error: {
        message: 'Rate limit exceeded',
        name: 'RateLimitError',
      },
    }),

    invalidApiKey: () => ({
      data: null,
      error: {
        message: 'Invalid API key',
        name: 'AuthenticationError',
      },
    }),
  },

  reactEmail: {
    success: () => `<html><body>${faker.lorem.paragraphs(2)}</body></html>`,
    error: () => {
      throw new Error('Template rendering failed');
    },
  },

  environment: {
    complete: () => ({
      RESEND_FROM: generateEmailAddress.corporate(),
      RESEND_TOKEN: `re_${faker.string.alphanumeric(32)}`,
    }),

    missingToken: () => ({
      RESEND_FROM: generateEmailAddress.corporate(),
      RESEND_TOKEN: '',
    }),

    missingFrom: () => ({
      RESEND_FROM: '',
      RESEND_TOKEN: `re_${faker.string.alphanumeric(32)}`,
    }),

    empty: () => ({
      RESEND_FROM: '',
      RESEND_TOKEN: '',
    }),
  },
};

/**
 * Generates test data sets for bulk testing
 */
export const generateBulkTestData = {
  multipleEmails: (count: number = 10) =>
    Array.from({ length: count }, () => generateCompleteEmailData.magicLink()),

  mixedEmailTypes: () => [
    generateCompleteEmailData.magicLink(),
    generateCompleteEmailData.verification(),
    generateCompleteEmailData.passwordReset(),
    generateCompleteEmailData.otp(),
    generateCompleteEmailData.contact(),
    generateCompleteEmailData.organizationInvitation(),
    generateCompleteEmailData.welcome(),
    generateCompleteEmailData.apiKeyCreated(),
  ],

  edgeCaseVariations: (baseData: any) => [
    baseData,
    { ...baseData, name: null },
    { ...baseData, name: '' },
    { ...baseData, name: generateUserName.veryLong() },
    { ...baseData, name: generateUserName.withSpecialChars() },
    { ...baseData, name: generateUserName.unicode() },
    { ...baseData, email: generateEmailAddress.withPlus() },
    { ...baseData, email: generateEmailAddress.longLocal() },
  ],

  performanceTestData: (count: number = 100) =>
    Array.from({ length: count }, () => ({
      email: generateEmailAddress.valid(),
      name: generateUserName.full(),
      data: faker.lorem.paragraphs(3),
    })),
};

// ================================================================================================
// UTILITIES
// ================================================================================================

/**
 * Utilities for working with generated test data
 */
export const testDataUtils = {
  /**
   * Creates a deterministic seed for reproducible test data
   */
  seed: (value: string | number) => {
    faker.seed(typeof value === 'string' ? value.length : value);
  },

  /**
   * Resets faker to use random seed
   */
  resetSeed: () => {
    faker.seed();
  },

  /**
   * Creates variants of base data for comprehensive testing
   */
  createVariants: <T extends Record<string, any>>(
    baseData: T,
    fieldVariations: Partial<Record<keyof T, any[]>>,
  ) => {
    const variants: T[] = [];

    Object.entries(fieldVariations).forEach(([field, values]) => {
      values?.forEach(value => {
        variants.push({ ...baseData, [field]: value });
      });
    });

    return variants;
  },

  /**
   * Validates generated test data structure
   */
  validateTestData: (data: any, requiredFields: string[]) => {
    const missingFields = requiredFields.filter(field => !(field in data));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    return true;
  },

  /**
   * Anonymizes test data for privacy
   */
  anonymize: (data: any) => ({
    ...data,
    email: data.email ? 'test@example.com' : data.email,
    name: data.name ? 'Test User' : data.name,
  }),
};

/**
 * Pre-configured test data sets for common scenarios
 */
export const preConfiguredTestData = {
  // Standard valid data sets
  valid: {
    magicLink: generateCompleteEmailData.magicLink(),
    verification: generateCompleteEmailData.verification(),
    passwordReset: generateCompleteEmailData.passwordReset(),
    otp: generateCompleteEmailData.otp(),
    contact: generateCompleteEmailData.contact(),
    organizationInvitation: generateCompleteEmailData.organizationInvitation(),
    welcome: generateCompleteEmailData.welcome(),
    apiKeyCreated: generateCompleteEmailData.apiKeyCreated(),
  },

  // Edge case data sets
  edgeCases: {
    nullValues: {
      magicLink: generateCompleteEmailData.magicLink({ name: null }),
      verification: generateCompleteEmailData.verification({ name: null }),
      passwordReset: generateCompleteEmailData.passwordReset({ name: null }),
    },
    emptyValues: {
      magicLink: generateCompleteEmailData.magicLink({ name: '' }),
      verification: generateCompleteEmailData.verification({ name: '' }),
      passwordReset: generateCompleteEmailData.passwordReset({ name: '' }),
    },
    longValues: {
      magicLink: generateCompleteEmailData.magicLink({ name: generateUserName.veryLong() }),
      verification: generateCompleteEmailData.verification({ name: generateUserName.veryLong() }),
      passwordReset: generateCompleteEmailData.passwordReset({ name: generateUserName.veryLong() }),
    },
  },

  // Invalid data sets for negative testing
  invalid: {
    emails: {
      noAt: { email: generateEmailAddress.invalid.noAt() },
      noDomain: { email: generateEmailAddress.invalid.noDomain() },
      noLocal: { email: generateEmailAddress.invalid.noLocal() },
      doubleAt: { email: generateEmailAddress.invalid.doubleAt() },
    },
    urls: {
      noProtocol: { magicLink: generateUrls.invalid.noProtocol() },
      noHost: { magicLink: generateUrls.invalid.noHost() },
      malformed: { magicLink: generateUrls.invalid.malformed() },
    },
  },
};
