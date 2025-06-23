/**
 * Simplified service contamination tests
 * Quick validation without Vite builds
 */

import { describe, test, expect } from 'vitest';
import path from 'path';
import { analyzeImportChain, checkForbiddenModules } from './utils/import-analyzer';

const PACKAGE_ROOT = path.resolve(__dirname, '..');

// Service-specific forbidden patterns
const SERVICE_PATTERNS = {
  database: [
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
  auth: [/jsonwebtoken/, /bcrypt/, /argon2/, /scrypt/, /pbkdf2/, /^crypto$/, /node:crypto/],
  storage: [
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
  email: [/nodemailer/, /smtp/, /@sendgrid\/mail/, /postmark/, /mailgun/],
  analytics: [/posthog-node/, /@segment\/analytics-node/, /mixpanel.*server/, /amplitude.*server/],
} as const;

describe('Service-Specific Contamination Tests', () => {
  test('edge export has no database client imports', async () => {
    const analysis = await analyzeImportChain(
      path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
      new Set(),
      PACKAGE_ROOT,
    );

    const dbViolations = Array.from(analysis.allDependencies).filter((dep) =>
      SERVICE_PATTERNS.database.some((pattern) => pattern.test(dep)),
    );

    expect(dbViolations).toEqual([]);

    console.log('Edge export - Database check:', {
      totalDependencies: analysis.allDependencies.size,
      databaseViolations: dbViolations.length,
    });
  });

  test('browser exports have no server-side services', async () => {
    const browserExports = [
      path.join(PACKAGE_ROOT, 'client.ts'),
      path.join(PACKAGE_ROOT, 'client-next.ts'),
    ];

    for (const exportPath of browserExports) {
      const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);

      const serviceViolations = Array.from(analysis.allDependencies).filter((dep) =>
        Object.values(SERVICE_PATTERNS).some((patterns) =>
          patterns.some((pattern) => pattern.test(dep)),
        ),
      );

      expect(serviceViolations).toEqual([]);

      console.log(`${path.basename(exportPath)} - Service check:`, {
        totalDependencies: analysis.allDependencies.size,
        serviceViolations: serviceViolations.length,
      });
    }
  });

  test('auth services not in edge runtime', async () => {
    const analysis = await analyzeImportChain(
      path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
      new Set(),
      PACKAGE_ROOT,
    );

    const authViolations = Array.from(analysis.allDependencies).filter((dep) =>
      SERVICE_PATTERNS.auth.some((pattern) => pattern.test(dep)),
    );

    expect(authViolations).toEqual([]);

    console.log('Edge export - Auth check:', {
      authViolations: authViolations.length,
      checkedPatterns: SERVICE_PATTERNS.auth.length,
    });
  });

  test('storage services not in browser exports', async () => {
    const browserExports = [
      path.join(PACKAGE_ROOT, 'client.ts'),
      path.join(PACKAGE_ROOT, 'client-next.ts'),
    ];

    for (const exportPath of browserExports) {
      const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);

      const storageViolations = Array.from(analysis.allDependencies).filter((dep) =>
        SERVICE_PATTERNS.storage.some((pattern) => pattern.test(dep)),
      );

      expect(storageViolations).toEqual([]);

      console.log(`${path.basename(exportPath)} - Storage check:`, {
        storageViolations: storageViolations.length,
      });
    }
  });

  test('email services not in edge runtime', async () => {
    const analysis = await analyzeImportChain(
      path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
      new Set(),
      PACKAGE_ROOT,
    );

    const emailViolations = Array.from(analysis.allDependencies).filter((dep) =>
      SERVICE_PATTERNS.email.some((pattern) => pattern.test(dep)),
    );

    expect(emailViolations).toEqual([]);

    console.log('Edge export - Email check:', {
      emailViolations: emailViolations.length,
    });
  });

  test('server analytics not in browser', async () => {
    const browserExports = [
      path.join(PACKAGE_ROOT, 'client.ts'),
      path.join(PACKAGE_ROOT, 'client-next.ts'),
    ];

    for (const exportPath of browserExports) {
      const analysis = await analyzeImportChain(exportPath, new Set(), PACKAGE_ROOT);

      const analyticsViolations = Array.from(analysis.allDependencies).filter((dep) =>
        SERVICE_PATTERNS.analytics.some((pattern) => pattern.test(dep)),
      );

      expect(analyticsViolations).toEqual([]);

      console.log(`${path.basename(exportPath)} - Analytics check:`, {
        analyticsViolations: analyticsViolations.length,
      });
    }
  });

  test('all export files exist and are readable', async () => {
    const exportFiles = [
      'client.ts',
      'server.ts',
      'client-next.ts',
      'server-next.ts',
      'server-next-edge.ts',
    ];

    const fs = await import('fs/promises');

    for (const file of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, file);

      try {
        await fs.access(filePath);
        const stats = await fs.stat(filePath);
        expect(stats.isFile()).toBe(true);
        expect(stats.size).toBeGreaterThan(0);

        console.log(`${file}: ${stats.size} bytes ✅`);
      } catch (error) {
        throw new Error(`Export file ${file} is not accessible: ${error}`);
      }
    }
  });

  test('runtime detection patterns are consistent', async () => {
    const fs = await import('fs/promises');

    const files = ['server-next.ts', 'server-next-edge.ts'];

    for (const file of files) {
      const filePath = path.join(PACKAGE_ROOT, file);
      const content = await fs.readFile(filePath, 'utf-8');

      const hasRuntimeCheck = content.includes('NEXT_RUNTIME');

      if (hasRuntimeCheck) {
        // Check for consistent runtime detection patterns
        const validPatterns = [
          /process\.env\.NEXT_RUNTIME\s*===\s*['"]edge['"]/,
          /process\.env\.NEXT_RUNTIME\s*===\s*['"]nodejs['"]/,
          /process\.env\.NEXT_RUNTIME\s*!==\s*['"]edge['"]/,
        ];

        const hasValidPattern = validPatterns.some((pattern) => pattern.test(content));
        expect(hasValidPattern).toBe(true);

        console.log(`${file} - Runtime detection: ✅`);
      } else {
        console.log(`${file} - No runtime detection (OK)`);
      }
    }
  });
});
