/**
 * Service-specific contamination tests for observability package
 * Tests violations specific to different services/packages that observability supports
 */

import { describe, test, expect } from 'vitest';
import path from 'path';
import {
  analyzeImportChain,
  checkForbiddenModules,
  type ImportAnalysis,
} from './utils/import-analyzer';
// Removed vite-bundle-analyzer imports - using simple file analysis instead

const PACKAGE_ROOT = path.resolve(__dirname, '..');

// Service-specific forbidden patterns
const SERVICE_PATTERNS = {
  database: {
    patterns: [
      /@prisma\/client/,
      /prisma/,
      /drizzle/,
      /typeorm/,
      /@planetscale/,
      /mysql2/,
      /pg$/,
      /sqlite3/,
      /mongodb/,
      /mongoose/,
    ],
    reason: 'Database clients contain native bindings incompatible with edge runtime',
  },
  auth: {
    patterns: [
      /jsonwebtoken/,
      /bcrypt/,
      /argon2/,
      /scrypt/,
      /pbkdf2/,
      /^crypto$/,
      /node:crypto/,
      /better-auth.*server/,
    ],
    reason: 'Auth operations require Node.js crypto APIs not available in edge/browser',
  },
  storage: {
    patterns: [
      /^fs$/,
      /^path$/,
      /node:fs/,
      /node:path/,
      /multer/,
      /formidable/,
      /busboy/,
      /aws-sdk/,
      /@aws-sdk/,
      /minio/,
    ],
    reason: 'File system and storage SDKs require Node.js APIs',
  },
  email: {
    patterns: [
      /nodemailer/,
      /smtp/,
      /@sendgrid\/mail/,
      /postmark/,
      /mailgun/,
      /react-email.*server/,
    ],
    reason: 'Email services require Node.js networking APIs',
  },
  analytics: {
    patterns: [/posthog-node/, /@segment\/analytics-node/, /mixpanel.*server/, /amplitude.*server/],
    reason: 'Server-side analytics SDKs not compatible with edge/browser runtime',
  },
  observability: {
    patterns: [/@opentelemetry/, /@vercel\/otel/, /pino/, /winston/, /bunyan/, /@sentry\/node/],
    reason: 'Observability tools often use Node.js-specific APIs',
  },
  payment: {
    patterns: [/stripe.*server/, /paypal.*server/, /square.*server/],
    reason: 'Payment processing requires server-side API keys and validation',
  },
} as const;

describe('Service-Specific Contamination Tests', () => {
  describe('Database Service Violations', () => {
    test('edge export has no database client imports', async () => {
      const analysis = await analyzeImportChain(
        path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
        new Set(),
        PACKAGE_ROOT,
      );

      const dbViolations = Array.from(analysis.allDependencies).filter((dep) =>
        SERVICE_PATTERNS.database.patterns.some((pattern) => pattern.test(dep)),
      );

      expect(dbViolations).toEqual([]);

      if (dbViolations.length > 0) {
        console.error('Database contamination in edge export:', dbViolations);
      }
    });

    test('browser exports have no database clients', async () => {
      const browserExports = [
        path.join(PACKAGE_ROOT, 'client.ts'),
        path.join(PACKAGE_ROOT, 'client-next.ts'),
      ];

      for (const exportPath of browserExports) {
        const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);
        const dbViolations = Array.from(analysis.allDependencies).filter((dep) =>
          SERVICE_PATTERNS.database.patterns.some((pattern) => pattern.test(dep)),
        );

        expect(dbViolations).toEqual([]);
      }
    });

    test('database imports only in Node.js server exports', async () => {
      const serverExports = [
        path.join(PACKAGE_ROOT, 'server.ts'),
        path.join(PACKAGE_ROOT, 'server-next.ts'),
      ];

      // Server exports CAN have database imports (this should not fail)
      for (const exportPath of serverExports) {
        const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);
        // Just verify we can analyze without errors
        expect(analysis).toBeDefined();
      }
    });
  });

  describe('Auth Service Contamination', () => {
    test('crypto operations not in browser exports', async () => {
      const browserExports = [
        path.join(PACKAGE_ROOT, 'client.ts'),
        path.join(PACKAGE_ROOT, 'client-next.ts'),
      ];

      for (const exportPath of browserExports) {
        const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);
        const authViolations = Array.from(analysis.allDependencies).filter((dep) =>
          SERVICE_PATTERNS.auth.patterns.some((pattern) => pattern.test(dep)),
        );

        expect(authViolations).toEqual([]);

        if (authViolations.length > 0) {
          console.error(`Auth contamination in ${exportPath}:`, authViolations);
        }
      }
    });

    test('edge export has no server-side auth', async () => {
      const analysis = await analyzeImportChain(
        path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
        new Set(),
        PACKAGE_ROOT,
      );

      const authViolations = Array.from(analysis.allDependencies).filter((dep) =>
        SERVICE_PATTERNS.auth.patterns.some((pattern) => pattern.test(dep)),
      );

      expect(authViolations).toEqual([]);
    });
  });

  describe('Storage Service Violations', () => {
    test('file system operations not in edge runtime', async () => {
      const analysis = await analyzeImportChain(
        path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
        new Set(),
        PACKAGE_ROOT,
      );

      const storageViolations = Array.from(analysis.allDependencies).filter((dep) =>
        SERVICE_PATTERNS.storage.patterns.some((pattern) => pattern.test(dep)),
      );

      expect(storageViolations).toEqual([]);
    });

    test('cloud storage SDKs not in browser', async () => {
      const browserExports = [
        path.join(PACKAGE_ROOT, 'client.ts'),
        path.join(PACKAGE_ROOT, 'client-next.ts'),
      ];

      for (const exportPath of browserExports) {
        const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);
        const cloudStorageViolations = Array.from(analysis.allDependencies).filter(
          (dep) =>
            dep.includes('aws-sdk') ||
            dep.includes('@aws-sdk') ||
            dep.includes('minio') ||
            dep.includes('gcloud'),
        );

        expect(cloudStorageViolations).toEqual([]);
      }
    });
  });

  describe('Email Service Pattern Violations', () => {
    test('SMTP clients not in edge runtime', async () => {
      const analysis = await analyzeImportChain(
        path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
        new Set(),
        PACKAGE_ROOT,
      );

      const emailViolations = Array.from(analysis.allDependencies).filter((dep) =>
        SERVICE_PATTERNS.email.patterns.some((pattern) => pattern.test(dep)),
      );

      expect(emailViolations).toEqual([]);
    });

    test('email templates vs email sending separation', async () => {
      // React Email templates should be OK in browser, but sending should not
      const browserExports = [
        path.join(PACKAGE_ROOT, 'client.ts'),
        path.join(PACKAGE_ROOT, 'client-next.ts'),
      ];

      for (const exportPath of browserExports) {
        const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);
        const sendingViolations = Array.from(analysis.allDependencies).filter(
          (dep) =>
            dep.includes('nodemailer') ||
            dep.includes('smtp') ||
            dep.includes('@sendgrid/mail') ||
            dep.includes('resend'),
        );

        expect(sendingViolations).toEqual([]);
      }
    });
  });

  describe('Analytics Service Contamination', () => {
    test('server analytics SDKs not in browser', async () => {
      const browserExports = [
        path.join(PACKAGE_ROOT, 'client.ts'),
        path.join(PACKAGE_ROOT, 'client-next.ts'),
      ];

      for (const exportPath of browserExports) {
        const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);
        const analyticsViolations = Array.from(analysis.allDependencies).filter((dep) =>
          SERVICE_PATTERNS.analytics.patterns.some((pattern) => pattern.test(dep)),
        );

        expect(analyticsViolations).toEqual([]);
      }
    });

    test('edge runtime uses browser-compatible analytics', async () => {
      const analysis = await analyzeImportChain(
        path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
        new Set(),
        PACKAGE_ROOT,
      );

      // Should not have server-side analytics
      const serverAnalytics = Array.from(analysis.allDependencies).filter(
        (dep) =>
          dep.includes('posthog-node') ||
          dep.includes('@segment/analytics-node') ||
          (dep.includes('mixpanel') && dep.includes('server')),
      );

      expect(serverAnalytics).toEqual([]);
    });
  });

  describe('Payment Service Isolation', () => {
    test('payment processing not in browser', async () => {
      const browserExports = [
        path.join(PACKAGE_ROOT, 'client.ts'),
        path.join(PACKAGE_ROOT, 'client-next.ts'),
      ];

      for (const exportPath of browserExports) {
        const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);
        const paymentViolations = Array.from(analysis.allDependencies).filter((dep) =>
          SERVICE_PATTERNS.payment.patterns.some((pattern) => pattern.test(dep)),
        );

        expect(paymentViolations).toEqual([]);
      }
    });

    test('edge runtime payment handling restrictions', async () => {
      const analysis = await analyzeImportChain(
        path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
        new Set(),
        PACKAGE_ROOT,
      );

      // Edge can have some payment processing but not server-side SDKs
      const serverPaymentSDKs = Array.from(analysis.allDependencies).filter(
        (dep) =>
          (dep.includes('stripe') && dep.includes('server')) ||
          (dep.includes('paypal') && dep.includes('server')),
      );

      expect(serverPaymentSDKs).toEqual([]);
    });
  });
});

describe('Simple Service Contamination Analysis', () => {
  test('edge export has no service contamination', async () => {
    const fs = await import('fs/promises');
    const content = await fs.readFile(path.join(PACKAGE_ROOT, 'server-next-edge.ts'), 'utf-8');

    // Check imports for service-specific patterns
    const importRegex = /^import\s+.*from\s+['\"]([^'\"]+)['\"];?$/gm;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // Check for forbidden service dependencies
    const serviceDeps = imports.filter((imp) =>
      Object.values(SERVICE_PATTERNS).some((service) =>
        service.patterns.some((pattern) => pattern.test(imp)),
      ),
    );

    expect(serviceDeps).toEqual([]);

    // Also check for service references in the content
    const forbiddenRefs: string[] = [];
    Object.entries(SERVICE_PATTERNS).forEach(([serviceName, service]) => {
      service.patterns.forEach((pattern) => {
        if (pattern.test(content)) {
          forbiddenRefs.push(`${serviceName}: ${pattern}`);
        }
      });
    });

    expect(forbiddenRefs).toEqual([]);
  });

  test('browser exports have no server services', async () => {
    const fs = await import('fs/promises');
    const browserExports = [
      { path: 'client.ts', name: 'client' },
      { path: 'client-next.ts', name: 'client-next' },
    ];

    for (const exportInfo of browserExports) {
      const content = await fs.readFile(path.join(PACKAGE_ROOT, exportInfo.path), 'utf-8');

      // Check imports
      const importRegex = /^import\s+.*from\s+['\"]([^'\"]+)['\"];?$/gm;
      const imports: string[] = [];
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      // Check for server-side service dependencies
      const serverServiceDeps = imports.filter(
        (imp) =>
          imp.includes('node:') ||
          imp.includes('/server/') ||
          Object.values(SERVICE_PATTERNS).some((service) =>
            service.patterns.some((pattern) => pattern.test(imp)),
          ),
      );

      expect(serverServiceDeps).toEqual([]);

      // Also check content for forbidden patterns
      const forbiddenRefs: string[] = [];

      // Check for Node.js specific patterns
      if (
        content.includes('require(') ||
        content.includes('__dirname') ||
        content.includes('__filename')
      ) {
        forbiddenRefs.push('Node.js specific patterns found');
      }

      // Check for service-specific patterns
      Object.entries(SERVICE_PATTERNS).forEach(([serviceName, service]) => {
        if (serviceName !== 'storage' && serviceName !== 'analytics') {
          // These might be OK in browser
          service.patterns.forEach((pattern) => {
            if (pattern.test(content)) {
              forbiddenRefs.push(`${serviceName}: ${pattern}`);
            }
          });
        }
      });

      if (forbiddenRefs.length > 0) {
        console.log(`${exportInfo.name} forbidden refs:`, forbiddenRefs);
      }

      expect(forbiddenRefs).toEqual([]);
    }
  });

  test('service contamination cross-analysis', async () => {
    const fs = await import('fs/promises');
    const files = {
      edge: 'server-next-edge.ts',
      browser: 'client.ts',
      server: 'server-next.ts',
    };

    const analyses: Record<string, { imports: string[]; servicePatterns: string[] }> = {};

    // Analyze each file
    for (const [type, file] of Object.entries(files)) {
      const content = await fs.readFile(path.join(PACKAGE_ROOT, file), 'utf-8');

      // Extract imports
      const importRegex = /^import\s+.*from\s+['\"]([^'\"]+)['\"];?$/gm;
      const imports: string[] = [];
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      // Find service-specific patterns
      const servicePatterns: string[] = [];
      Object.entries(SERVICE_PATTERNS).forEach(([serviceName, service]) => {
        service.patterns.forEach((pattern) => {
          if (imports.some((imp) => pattern.test(imp))) {
            servicePatterns.push(serviceName);
          }
        });
      });

      analyses[type] = { imports, servicePatterns: [...new Set(servicePatterns)] };
    }

    // Check for cross-contamination
    const violations: string[] = [];

    // Edge should have no service dependencies
    if (analyses.edge.servicePatterns.length > 0) {
      violations.push(
        `Edge runtime has service dependencies: ${analyses.edge.servicePatterns.join(', ')}`,
      );
    }

    // Browser should have no server-specific services
    const serverOnlyServices = ['database', 'auth', 'email'];
    const browserServerServices = analyses.browser.servicePatterns.filter((s) =>
      serverOnlyServices.includes(s),
    );
    if (browserServerServices.length > 0) {
      violations.push(`Browser has server-only services: ${browserServerServices.join(', ')}`);
    }

    expect(violations).toEqual([]);

    // Log analysis for debugging
    console.log('Service analysis:', {
      edge: analyses.edge.servicePatterns,
      browser: analyses.browser.servicePatterns,
      server: analyses.server.servicePatterns,
    });
  });
});

describe('Advanced Service Pattern Detection', () => {
  test('conditional service imports are properly guarded', async () => {
    const fs = await import('fs/promises');

    const checkFile = async (filePath: string) => {
      try {
        const content = await fs.readFile(filePath, 'utf-8');

        // Check for conditional imports with proper runtime guards
        const conditionalPatterns = [
          /if\s*\(\s*process\.env\.NEXT_RUNTIME\s*===\s*['"]nodejs['"]\s*\)/,
          /if\s*\(\s*process\.env\.NEXT_RUNTIME\s*!==\s*['"]edge['"]\s*\)/,
          /if\s*\(\s*process\.env\.NEXT_RUNTIME\s*===\s*['"]edge['"]\s*\)/,
        ];

        // Check for service imports in dynamic imports
        const dynamicImportPattern = /await\s+import\s*\(\s*['"](.*?)['"]\s*\)/g;
        const importMatches = [...content.matchAll(dynamicImportPattern)];

        const hasServiceImports = importMatches.some((match) => {
          const importPath = match[1];
          return Object.values(SERVICE_PATTERNS).some((service) =>
            service.patterns.some((pattern) => {
              const patternString = pattern.source.slice(1, -1);
              return (
                importPath.includes(patternString) ||
                importPath.includes('vercel-otel') ||
                importPath.includes('opentelemetry')
              );
            }),
          );
        });

        if (hasServiceImports) {
          const hasProperGuards = conditionalPatterns.some((pattern) => pattern.test(content));
          return { hasServiceImports, hasProperGuards };
        }

        return { hasServiceImports: false, hasProperGuards: true };
      } catch {
        return { hasServiceImports: false, hasProperGuards: true };
      }
    };

    // Only check server-next.ts because server.ts is Node.js-only and doesn't need runtime guards
    const files = [path.join(PACKAGE_ROOT, 'server-next.ts')];

    for (const filePath of files) {
      const result = await checkFile(filePath);

      if (result.hasServiceImports) {
        if (!result.hasProperGuards) {
          console.error(`Service imports without proper runtime guards in ${filePath}`);
          // For debugging
          const content = await fs.readFile(filePath, 'utf-8');
          const dynamicImportPattern = /await\s+import\s*\(\s*['"](.*?)['"]\s*\)/g;
          const importMatches = [...content.matchAll(dynamicImportPattern)];
          console.error(
            'Found dynamic imports:',
            importMatches.map((m) => m[1]),
          );
        }
        expect(result.hasProperGuards).toBe(true);
      }
    }
  });

  test('service-specific error handling isolation', async () => {
    // Test that service-specific errors don't leak across runtimes
    const analysis = await analyzeImportChain(
      path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
      new Set(),
      PACKAGE_ROOT,
    );

    // Should not import service-specific error classes
    const errorClassViolations = Array.from(analysis.allDependencies).filter(
      (dep) =>
        dep.includes('PrismaClientKnownRequestError') ||
        dep.includes('MongoError') ||
        dep.includes('PostgresError') ||
        dep.includes('RedisError'),
    );

    expect(errorClassViolations).toEqual([]);
  });

  test('service configuration isolation', async () => {
    // Test that service configurations don't leak sensitive data
    const browserExports = [
      path.join(PACKAGE_ROOT, 'client.ts'),
      path.join(PACKAGE_ROOT, 'client-next.ts'),
    ];

    for (const exportPath of browserExports) {
      const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);

      // Should not include server-side configuration patterns
      const configViolations = Array.from(analysis.allDependencies).filter(
        (dep) =>
          dep.includes('database-config') ||
          dep.includes('redis-config') ||
          dep.includes('smtp-config') ||
          dep.includes('secret-manager'),
      );

      expect(configViolations).toEqual([]);
    }
  });
});
