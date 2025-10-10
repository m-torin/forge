/**
 * Storage Test Data Generators
 *
 * Comprehensive test data generation for all storage functionality using faker.js
 * for realistic test scenarios. Follows the successful email package DRY pattern.
 */

import { faker } from '@faker-js/faker';

/**
 * Storage key generators - realistic file paths and keys
 */
export const generateStorageKeys = {
  /**
   * Generates valid storage keys for different file types
   */
  valid: () => ({
    image:
      faker.system.filePath().replace(/\\/g, '/') +
      '/' +
      faker.system.fileName({ extensionCount: 1 }).replace(/\.[^.]+$/, '.jpg'),
    document:
      faker.system.filePath().replace(/\\/g, '/') +
      '/' +
      faker.system.fileName({ extensionCount: 1 }).replace(/\.[^.]+$/, '.pdf'),
    video:
      faker.system.filePath().replace(/\\/g, '/') +
      '/' +
      faker.system.fileName({ extensionCount: 1 }).replace(/\.[^.]+$/, '.mp4'),
    simple: faker.system.fileName({ extensionCount: 1 }),
    nested: `${faker.lorem.word()}/${faker.lorem.word()}/${faker.system.fileName({ extensionCount: 1 })}`,
    timestamped: `${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${faker.system.fileName({ extensionCount: 1 })}`,
    uuid: `${faker.string.uuid()}.${faker.system.fileExt()}`,
  }),

  /**
   * Generates invalid storage keys for error testing
   */
  invalid: () => ({
    empty: '',
    null: null,
    undefined: undefined,
    withDoubleSlash: `folder//${faker.system.fileName({ extensionCount: 1 })}`,
    withBackslash: `folder\\${faker.system.fileName({ extensionCount: 1 })}`,
    tooLong: 'x'.repeat(1025) + '.txt',
    specialChars: `${faker.system.fileName({ extensionCount: 1 })}?#[]{}`,
    relativeUp: `../${faker.system.fileName({ extensionCount: 1 })}`,
    absolutePath: `/${faker.system.fileName({ extensionCount: 1 })}`,
  }),

  /**
   * Generates edge case storage keys
   */
  edgeCases: () => ({
    maxLength: 'a'.repeat(1023) + '.txt',
    unicode: `${faker.lorem.word()}-测试文件-${faker.system.fileName({ extensionCount: 1 })}`,
    withSpaces: `my folder/my file ${faker.number.int({ min: 1, max: 999 })}.txt`,
    withDots: `...${faker.system.fileName({ extensionCount: 1 })}`,
    onlyExtension: `.${faker.system.fileExt()}`,
    noExtension: faker.lorem.word(),
    multipleExtensions: `${faker.lorem.word()}.backup.${faker.system.fileExt()}`,
  }),
};

/**
 * File content generators - various data types and sizes
 */
export const generateFileContent = {
  /**
   * Generates different types of file content
   */
  byType: () => ({
    text: Buffer.from(faker.lorem.paragraphs(3)),
    json: Buffer.from(
      JSON.stringify({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        data: JSON.stringify({ test: faker.lorem.word() }),
      }),
    ),
    csv: Buffer.from(
      [
        'id,name,email,created',
        `${faker.string.uuid()},${faker.person.fullName()},${faker.internet.email()},${faker.date.past().toISOString()}`,
        `${faker.string.uuid()},${faker.person.fullName()},${faker.internet.email()},${faker.date.past().toISOString()}`,
        `${faker.string.uuid()},${faker.person.fullName()},${faker.internet.email()},${faker.date.past().toISOString()}`,
      ].join('\n'),
    ),
    xml: Buffer.from(`<?xml version="1.0"?>
<data>
  <item id="${faker.string.uuid()}">
    <name>${faker.person.fullName()}</name>
    <email>${faker.internet.email()}</email>
  </item>
</data>`),
    binary: Buffer.from(faker.string.binary({ length: 1024 })),
    empty: Buffer.alloc(0),
  }),

  /**
   * Generates content of different sizes
   */
  bySizes: () => ({
    tiny: Buffer.from(faker.lorem.words(5)), // ~50 bytes
    small: Buffer.from(faker.lorem.paragraphs(2)), // ~500 bytes
    medium: Buffer.from(faker.lorem.paragraphs(20)), // ~5KB
    large: Buffer.from(faker.lorem.paragraphs(200)), // ~50KB
    extraLarge: Buffer.alloc(1024 * 1024, 'a'), // 1MB
  }),

  /**
   * Generates Blob content for browser environments
   */
  asBlobs: () => ({
    textBlob: new Blob([faker.lorem.paragraphs(2)], { type: 'text/plain' }),
    jsonBlob: new Blob([JSON.stringify({ data: JSON.stringify({ key: faker.lorem.word() }) })], {
      type: 'application/json',
    }),
    imageBlob: new Blob([Buffer.from(faker.string.binary({ length: 1024 }))], {
      type: 'image/jpeg',
    }),
    pdfBlob: new Blob([Buffer.from(faker.string.binary({ length: 2048 }))], {
      type: 'application/pdf',
    }),
    emptyBlob: new Blob([]),
  }),

  /**
   * Generates File objects for form uploads
   */
  asFiles: () => ({
    textFile: new File([faker.lorem.paragraphs(2)], 'document.txt', { type: 'text/plain' }),
    imageFile: new File([Buffer.from(faker.string.binary({ length: 1024 }))], 'photo.jpg', {
      type: 'image/jpeg',
    }),
    documentFile: new File([Buffer.from(faker.string.binary({ length: 2048 }))], 'report.pdf', {
      type: 'application/pdf',
    }),
    largeFile: new File([Buffer.alloc(1024 * 100, 'x')], 'large.bin', {
      type: 'application/octet-stream',
    }),
  }),

  /**
   * Generates edge case content
   */
  edgeCases: () => ({
    nullBytes: Buffer.from([0, 0, 0, 0]),
    unicode: Buffer.from('Hello 世界 🌍 测试 файл'),
    longText: Buffer.from(faker.lorem.paragraphs(1000)),
    binaryData: Buffer.from(new Uint8Array(Array.from({ length: 256 }, (_, i) => i))),
    malformed: Buffer.from('{"incomplete": json'),
  }),
};

/**
 * Storage provider configuration generators
 */
export const generateProviderConfigs = {
  /**
   * Generates Cloudflare R2 configurations
   */
  cloudflareR2: () => ({
    valid: {
      bucket: faker.lorem.word().toLowerCase(),
      accountId: faker.string.alphanumeric(32),
      accessKeyId: faker.string.alphanumeric(20),
      secretAccessKey: faker.string.alphanumeric(40),
      region: faker.helpers.arrayElement(['auto', 'us-east-1', 'eu-west-1']),
      customDomain: faker.internet.domainName(),
    },
    minimal: {
      bucket: faker.lorem.word().toLowerCase(),
      accountId: faker.string.alphanumeric(32),
      accessKeyId: faker.string.alphanumeric(20),
      secretAccessKey: faker.string.alphanumeric(40),
    },
    invalid: {
      empty: {},
      missingBucket: {
        accountId: faker.string.alphanumeric(32),
        accessKeyId: faker.string.alphanumeric(20),
        secretAccessKey: faker.string.alphanumeric(40),
      },
      invalidBucket: {
        bucket: 'Invalid Bucket Name!',
        accountId: faker.string.alphanumeric(32),
        accessKeyId: faker.string.alphanumeric(20),
        secretAccessKey: faker.string.alphanumeric(40),
      },
    },
  }),

  /**
   * Generates Vercel Blob configurations
   */
  vercelBlob: () => ({
    valid: {
      token: `vercel_blob_rw_${faker.string.alphanumeric(32)}_${faker.string.alphanumeric(16)}`,
    },
    invalid: {
      empty: { token: '' },
      null: { token: null },
      undefined: { token: undefined },
      wrongFormat: { token: 'invalid-token-format' },
    },
  }),

  /**
   * Generates Cloudflare Images configurations
   */
  cloudflareImages: () => ({
    valid: {
      accountId: faker.string.alphanumeric(32),
      apiToken: faker.string.alphanumeric(40),
      accountHash: faker.string.alphanumeric(16),
    },
    minimal: {
      accountId: faker.string.alphanumeric(32),
      apiToken: faker.string.alphanumeric(40),
    },
    invalid: {
      empty: {},
      missingApiToken: {
        accountId: faker.string.alphanumeric(32),
      },
      invalidAccountId: {
        accountId: 'invalid-account-id',
        apiToken: faker.string.alphanumeric(40),
      },
    },
  }),

  /**
   * Generates multi-storage configurations
   */
  multiStorage: () => ({
    complete: {
      providers: {
        documents: {
          provider: 'cloudflare-r2',
          cloudflareR2: {
            bucket: 'documents-bucket',
            accountId: faker.string.alphanumeric(32),
            accessKeyId: faker.string.alphanumeric(20),
            secretAccessKey: faker.string.alphanumeric(40),
          },
        },
        images: {
          provider: 'cloudflare-images',
          cloudflareImages: {
            accountId: faker.string.alphanumeric(32),
            apiToken: faker.string.alphanumeric(40),
          },
        },
        cache: {
          provider: 'vercel-blob',
          vercelBlob: {
            token: `vercel_blob_rw_${faker.string.alphanumeric(32)}_${faker.string.alphanumeric(16)}`,
          },
        },
      },
      defaultProvider: 'documents',
      routing: {
        images: 'images',
        documents: 'documents',
        cache: 'cache',
      },
    },
    minimal: {
      providers: {
        storage: {
          provider: 'cloudflare-r2',
          cloudflareR2: {
            bucket: faker.lorem.word().toLowerCase(),
            accountId: faker.string.alphanumeric(32),
            accessKeyId: faker.string.alphanumeric(20),
            secretAccessKey: faker.string.alphanumeric(40),
          },
        },
      },
    },
  }),
};

/**
 * Storage operation options generators
 */
const generateOperationOptions = {
  /**
   * Generates upload options
   */
  upload: () => ({
    basic: {
      contentType: faker.helpers.arrayElement([
        'text/plain',
        'application/json',
        'image/jpeg',
        'application/pdf',
        'video/mp4',
      ]),
    },
    withCaching: {
      contentType: 'text/plain',
      cacheControl: faker.number.int({ min: 300, max: 86400 }),
    },
    withMetadata: {
      contentType: 'application/json',
      metadata: {
        uploadedBy: faker.person.fullName(),
        uploadedAt: faker.date.recent().toISOString(),
        purpose: faker.helpers.arrayElement(['backup', 'archive', 'temp', 'public']),
      },
    },
    withProvider: {
      provider: faker.helpers.arrayElement(['documents', 'images', 'cache']),
      contentType: 'text/plain',
    },
  }),

  /**
   * Generates list options
   */
  list: () => ({
    basic: {},
    withPrefix: {
      prefix: faker.helpers.arrayElement(['images/', 'documents/', 'uploads/', 'cache/']),
    },
    withLimit: {
      limit: faker.number.int({ min: 5, max: 100 }),
    },
    withCursor: {
      cursor: faker.string.alphanumeric(32),
      limit: 20,
    },
    complete: {
      prefix: 'documents/',
      limit: 50,
      cursor: faker.string.alphanumeric(32),
    },
  }),

  /**
   * Generates URL options
   */
  getUrl: () => ({
    basic: {},
    withExpiration: {
      expiresIn: faker.number.int({ min: 300, max: 86400 }),
    },
    withResponseHeaders: {
      responseHeaders: {
        'Content-Disposition': `attachment; filename="${faker.system.fileName({ extensionCount: 1 })}"`,
        'Content-Type': 'application/octet-stream',
      },
    },
    complete: {
      expiresIn: 3600,
      responseHeaders: {
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  }),
};

/**
 * Storage result generators - what storage operations should return
 */
export const generateStorageResults = {
  /**
   * Generates upload results
   */
  upload: (overrides: Record<string, any> = {}) => ({
    key: generateStorageKeys.valid().simple,
    url: faker.internet.url() + '/' + faker.system.fileName({ extensionCount: 1 }),
    size: faker.number.int({ min: 100, max: 1048576 }),
    contentType: faker.helpers.arrayElement(['text/plain', 'application/json', 'image/jpeg']),
    etag: faker.string.alphanumeric(32),
    lastModified: faker.date.recent(),
    ...overrides,
  }),

  /**
   * Generates metadata results
   */
  metadata: (overrides: Record<string, any> = {}) => ({
    key: generateStorageKeys.valid().simple,
    url: faker.internet.url() + '/' + faker.system.fileName({ extensionCount: 1 }),
    size: faker.number.int({ min: 100, max: 1048576 }),
    contentType: faker.helpers.arrayElement(['text/plain', 'application/json', 'image/jpeg']),
    etag: faker.string.alphanumeric(32),
    lastModified: faker.date.recent(),
    ...overrides,
  }),

  /**
   * Generates list results
   */
  list: (count: number = 3) =>
    Array.from({ length: count }, () => ({
      key: generateStorageKeys.valid().simple,
      url: faker.internet.url() + '/' + faker.system.fileName({ extensionCount: 1 }),
      size: faker.number.int({ min: 100, max: 1048576 }),
      contentType: faker.helpers.arrayElement(['text/plain', 'application/json', 'image/jpeg']),
      lastModified: faker.date.recent(),
    })),

  /**
   * Generates action results
   */
  action: {
    success: (data: any = null) => ({
      success: true,
      data,
      error: null,
    }),
    error: (errorMessage: string = 'Operation failed') => ({
      success: false,
      data: null,
      error: errorMessage,
    }),
  },
};

/**
 * Storage error generators - realistic error scenarios
 */
export const generateStorageErrors = {
  /**
   * Network and connectivity errors
   */
  network: () =>
    faker.helpers.arrayElement([
      new Error('Network request failed'),
      new Error('Connection timeout'),
      new Error('DNS resolution failed'),
      new Error('Service unavailable'),
      new Error('Rate limit exceeded'),
    ]),

  /**
   * Authentication and authorization errors
   */
  auth: () =>
    faker.helpers.arrayElement([
      new Error('Invalid credentials'),
      new Error('Access denied'),
      new Error('Token expired'),
      new Error('Insufficient permissions'),
      new Error('API key not found'),
    ]),

  /**
   * Storage-specific errors
   */
  storage: () =>
    faker.helpers.arrayElement([
      new Error('File not found'),
      new Error('Bucket does not exist'),
      new Error('Storage quota exceeded'),
      new Error('File too large'),
      new Error('Invalid file type'),
      new Error('Duplicate key'),
    ]),

  /**
   * Validation errors
   */
  validation: () =>
    faker.helpers.arrayElement([
      new Error('Invalid storage key'),
      new Error('Missing required parameter'),
      new Error('Invalid file content'),
      new Error('Unsupported content type'),
      new Error('Key too long'),
    ]),

  /**
   * Provider-specific errors
   */
  provider: {
    cloudflareR2: () =>
      faker.helpers.arrayElement([
        new Error('R2 API error'),
        new Error('Invalid R2 configuration'),
        new Error('R2 bucket not accessible'),
        new Error('R2 operation failed'),
      ]),
    vercelBlob: () =>
      faker.helpers.arrayElement([
        new Error('Vercel Blob API error'),
        new Error('Invalid blob token'),
        new Error('Blob not found'),
        new Error('Blob upload failed'),
      ]),
    cloudflareImages: () =>
      faker.helpers.arrayElement([
        new Error('Cloudflare Images API error'),
        new Error('Image upload failed'),
        new Error('Invalid image format'),
        new Error('Image processing failed'),
      ]),
  },
};

/**
 * Complete test scenarios generators
 */
const generateCompleteStorageData = {
  /**
   * Generates complete upload scenarios
   */
  uploadScenarios: (overrides: Record<string, any> = {}) => ({
    textUpload: {
      key: generateStorageKeys.valid().document,
      content: generateFileContent.byType().text,
      options: generateOperationOptions.upload().basic,
      expectedResult: generateStorageResults.upload(),
      ...overrides,
    },
    imageUpload: {
      key: generateStorageKeys.valid().image,
      content: generateFileContent.asFiles().imageFile,
      options: { ...generateOperationOptions.upload().basic, contentType: 'image/jpeg' },
      expectedResult: generateStorageResults.upload({ contentType: 'image/jpeg' }),
      ...overrides,
    },
    largeFileUpload: {
      key: generateStorageKeys.valid().simple,
      content: generateFileContent.bySizes().large,
      options: generateOperationOptions.upload().withCaching,
      expectedResult: generateStorageResults.upload({
        size: generateFileContent.bySizes().large.length,
      }),
      ...overrides,
    },
  }),

  /**
   * Generates complete provider test scenarios
   */
  providerScenarios: (providerName: string) => ({
    cloudflareR2: {
      config: generateProviderConfigs.cloudflareR2().valid,
      testKey: generateStorageKeys.valid().simple,
      testContent: generateFileContent.byType().text,
      expectedUrl: `https://pub-${generateProviderConfigs.cloudflareR2().valid.bucket}.r2.dev/`,
    },
    vercelBlob: {
      config: generateProviderConfigs.vercelBlob().valid,
      testKey: generateStorageKeys.valid().simple,
      testContent: generateFileContent.byType().text,
      expectedUrl: 'https://blob.vercel.com/',
    },
    cloudflareImages: {
      config: generateProviderConfigs.cloudflareImages().valid,
      testKey: generateStorageKeys.valid().image,
      testContent: generateFileContent.asFiles().imageFile,
      expectedUrl: `https://imagedelivery.net/${generateProviderConfigs.cloudflareImages().valid.accountHash}/`,
    },
  }),

  /**
   * Generates action test scenarios
   */
  actionScenarios: () => ({
    mediaUpload: {
      args: [generateStorageKeys.valid().image, generateFileContent.asFiles().imageFile],
      mockSetup: 'success',
      expectedResult: generateStorageResults.action.success(generateStorageResults.upload()),
    },
    mediaDownload: {
      args: [generateStorageKeys.valid().document],
      mockSetup: 'success',
      expectedResult: generateStorageResults.action.success(generateFileContent.asBlobs().textBlob),
    },
    mediaDelete: {
      args: [generateStorageKeys.valid().simple],
      mockSetup: 'success',
      expectedResult: generateStorageResults.action.success(null),
    },
    bulkDelete: {
      args: [[generateStorageKeys.valid().simple, generateStorageKeys.valid().document]],
      mockSetup: 'partial',
      expectedResult: {
        success: false,
        data: {
          succeeded: [generateStorageKeys.valid().simple],
          failed: [{ key: generateStorageKeys.valid().document, error: 'Delete failed' }],
        },
      },
    },
  }),

  /**
   * Generates edge case scenarios
   */
  edgeCaseScenarios: () => ({
    emptyFile: {
      key: generateStorageKeys.valid().simple,
      content: generateFileContent.byType().empty,
      shouldSucceed: true,
    },
    unicodeKey: {
      key: generateStorageKeys.edgeCases().unicode,
      content: generateFileContent.edgeCases().unicode,
      shouldSucceed: true,
    },
    largeFile: {
      key: generateStorageKeys.valid().simple,
      content: generateFileContent.bySizes().extraLarge,
      shouldSucceed: true,
    },
    invalidKey: {
      key: generateStorageKeys.invalid().relativeUp,
      content: generateFileContent.byType().text,
      shouldSucceed: false,
      expectedError: 'Invalid storage key',
    },
  }),

  /**
   * Generates performance test scenarios
   */
  performanceScenarios: () => ({
    singleUpload: {
      operation: 'upload',
      args: [generateStorageKeys.valid().simple, generateFileContent.bySizes().small],
      maxDuration: 1000,
    },
    batchUpload: {
      operation: 'batchUpload',
      batchSize: 10,
      maxDuration: 5000,
    },
    largeFileUpload: {
      operation: 'upload',
      args: [generateStorageKeys.valid().simple, generateFileContent.bySizes().large],
      maxDuration: 10000,
    },
    listOperation: {
      operation: 'list',
      args: [generateOperationOptions.list().withLimit],
      maxDuration: 2000,
    },
  }),
};

/**
 * Test data validation utilities
 */
export const validateTestData = {
  /**
   * Validates generated storage keys
   */
  storageKey: (key: string) => {
    if (!key || typeof key !== 'string') return false;
    if (key.length === 0 || key.length > 1024) return false;
    if (key.includes('../') || key.startsWith('/')) return false;
    return true;
  },

  /**
   * Validates generated file content
   */
  fileContent: (content: any) => {
    return (
      content instanceof Buffer ||
      content instanceof Blob ||
      content instanceof File ||
      content instanceof ArrayBuffer ||
      (typeof content === 'string' && content.length >= 0)
    );
  },

  /**
   * Validates provider configurations
   */
  providerConfig: (config: any, providerType: string) => {
    switch (providerType) {
      case 'cloudflare-r2':
        return config.bucket && config.accountId && config.accessKeyId && config.secretAccessKey;
      case 'vercel-blob':
        return config.token && typeof config.token === 'string';
      case 'cloudflare-images':
        return config.accountId && config.apiToken;
      default:
        return false;
    }
  },

  /**
   * Validates storage results
   */
  storageResult: (result: any) => {
    return (
      result &&
      typeof result.key === 'string' &&
      typeof result.url === 'string' &&
      typeof result.size === 'number'
    );
  },
};

/**
 * Factory for creating test data with specific characteristics
 */
export const createStorageTestData = {
  /**
   * Creates test data for specific provider
   */
  forProvider: (
    providerName: 'cloudflare-r2' | 'vercel-blob' | 'cloudflare-images',
    overrides = {},
  ) => {
    const scenarios = generateCompleteStorageData.providerScenarios(providerName);
    const keyMap = {
      'cloudflare-r2': 'cloudflareR2',
      'vercel-blob': 'vercelBlob',
      'cloudflare-images': 'cloudflareImages',
    } as const;
    const scenarioKey = keyMap[providerName];
    return {
      ...scenarios[scenarioKey],
      ...overrides,
    };
  },

  /**
   * Creates test data for specific operation
   */
  forOperation: (
    operation: 'upload' | 'download' | 'delete' | 'list' | 'exists',
    overrides = {},
  ) => {
    const baseData = {
      key: generateStorageKeys.valid().simple,
      content: generateFileContent.byType().text,
      options: {},
    };

    switch (operation) {
      case 'upload':
        return { ...baseData, options: generateOperationOptions.upload().basic, ...overrides };
      case 'list':
        return { options: generateOperationOptions.list().withLimit, ...overrides };
      default:
        return { ...baseData, ...overrides };
    }
  },

  /**
   * Creates edge case test data
   */
  edgeCase: (caseType: 'empty' | 'large' | 'unicode' | 'invalid', overrides = {}) => {
    const cases = generateCompleteStorageData.edgeCaseScenarios();
    const baseKey = Object.keys(cases).find(key => key.includes(caseType));
    return baseKey ? { ...(cases as any)[baseKey], ...overrides } : { ...overrides };
  },

  /**
   * Creates error scenario test data
   */
  errorScenario: (errorType: 'network' | 'auth' | 'storage' | 'validation', overrides = {}) => {
    return {
      key: generateStorageKeys.valid().simple,
      content: generateFileContent.byType().text,
      error: generateStorageErrors[errorType](),
      shouldThrow: true,
      ...overrides,
    };
  },
};
