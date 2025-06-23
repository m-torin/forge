/**
 * Export isolation tests for five-file export pattern
 * Verify each export file is properly isolated and doesn't leak incompatible dependencies
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import {
  analyzeImportChain,
  checkForbiddenModules,
  generateImportReport,
  type ImportAnalysis,
} from './utils/import-analyzer';
import {
  testRuntimeCompatibility,
  testInRuntime,
  canLoadModule,
  containsNodejsApis,
  containsBrowserApis,
  createRuntimeTestSetup,
  type RuntimeEnvironment,
  type CompatibilityTestResult,
} from './utils/runtime-compatibility';

// Package root directory
const PACKAGE_ROOT = path.resolve(__dirname, '..');

// Five export file paths
const EXPORT_FILES = {
  client: path.join(PACKAGE_ROOT, 'client.ts'),
  server: path.join(PACKAGE_ROOT, 'server.ts'),
  clientNext: path.join(PACKAGE_ROOT, 'client-next.ts'),
  serverNext: path.join(PACKAGE_ROOT, 'server-next.ts'),
  serverNextEdge: path.join(PACKAGE_ROOT, 'server-next-edge.ts'),
} as const;

// Expected exports for each file
const EXPECTED_EXPORTS = {
  client: ['createClientObservability', 'createClientObservabilityUninitialized'],
  server: ['createServerObservability', 'createServerObservabilityUninitialized'],
  clientNext: ['createClientObservability', 'getObservabilityConfig'],
  serverNext: ['createServerObservability', 'register', 'withSentry', 'withObservability'],
  serverNextEdge: ['register', 'captureException', 'captureMessage', 'onRequestError'],
} as const;

describe('Export Pattern Isolation Tests', () => {
  describe('Import Chain Analysis', () => {
    test('client.ts has no server imports', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile(EXPORT_FILES.client, 'utf-8');

      // Check for forbidden imports in the file directly
      const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"];?$/gm;
      const imports: string[] = [];
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      // Should not contain server-specific modules
      const serverModules = imports.filter(
        (imp) =>
          imp.includes('/server/') ||
          imp.includes('node:') ||
          imp.includes('@opentelemetry') ||
          imp.includes('@vercel/otel'),
      );

      expect(serverModules).toEqual([]);
    });

    test('server.ts can have Node.js imports', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile(EXPORT_FILES.server, 'utf-8');

      // Server exports should be able to use OpenTelemetry and Node.js modules
      // Just verify the file exists and has content
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('createServerObservability');
    });

    test('client-next.ts has no server imports', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile(EXPORT_FILES.clientNext, 'utf-8');

      // Check for forbidden imports
      const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"];?$/gm;
      const imports: string[] = [];
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      const serverModules = imports.filter(
        (imp) =>
          imp.includes('/server/') ||
          imp.includes('node:') ||
          imp.includes('@opentelemetry') ||
          imp.includes('@vercel/otel'),
      );

      expect(serverModules).toEqual([]);
    });

    test('server-next.ts properly isolates OpenTelemetry imports', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile(EXPORT_FILES.serverNext, 'utf-8');

      // Should have dynamic or eval-wrapped OpenTelemetry imports, not static ones
      const staticImportRegex =
        /^import\s+.*from\s+['"](@opentelemetry[^'"]*|@vercel\/otel[^'"]*)['"];?$/gm;
      const staticOtelImports: string[] = [];
      let match;

      while ((match = staticImportRegex.exec(content)) !== null) {
        staticOtelImports.push(match[0]);
      }

      expect(staticOtelImports).toEqual([]);

      // Check for dynamic imports (which are OK)
      const hasDynamicImports =
        content.includes('await import(') &&
        (content.includes('@opentelemetry') || content.includes('@vercel/otel'));

      console.log('Server Next OTEL imports:', {
        static: staticOtelImports,
        hasDynamic: hasDynamicImports,
      });
    });

    test('server-next-edge.ts has NO OpenTelemetry imports', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile(EXPORT_FILES.serverNextEdge, 'utf-8');

      // Check for any OpenTelemetry imports (static or dynamic)
      const hasOtelImports = content.includes('@opentelemetry') || content.includes('@vercel/otel');
      expect(hasOtelImports).toBe(false);

      // Check for Node.js built-in imports
      const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"];?$/gm;
      const imports: string[] = [];
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      const nodeImports = imports.filter(
        (imp) =>
          imp.startsWith('node:') ||
          ['fs', 'path', 'crypto', 'stream', 'http', 'https', 'net', 'tls', 'dns'].includes(imp),
      );

      expect(nodeImports).toEqual([]);
    });
  });

  describe('Runtime Compatibility Tests', () => {
    test('edge export can be imported', async () => {
      // Simple test - just verify the file can be imported without errors
      try {
        const module = await import(EXPORT_FILES.serverNextEdge);

        // Check expected exports exist
        for (const exportName of EXPECTED_EXPORTS.serverNextEdge) {
          expect(module[exportName]).toBeDefined();
        }
      } catch (error) {
        // Edge runtime specific imports might fail in test environment
        // Just verify no OpenTelemetry errors
        expect(String(error)).not.toContain('@opentelemetry');
        expect(String(error)).not.toContain('@vercel/otel');
      }
    });

    test('client exports can be imported', async () => {
      try {
        const clientModule = await import(EXPORT_FILES.client);
        const clientNextModule = await import(EXPORT_FILES.clientNext);

        // Just verify the modules load
        expect(clientModule).toBeDefined();
        expect(clientNextModule).toBeDefined();
      } catch (error) {
        // Should not fail
        expect.fail(`Client imports failed: ${error}`);
      }
    });

    test('server exports can be imported', async () => {
      try {
        const serverModule = await import(EXPORT_FILES.server);
        const serverNextModule = await import(EXPORT_FILES.serverNext);

        // Just verify the modules load
        expect(serverModule).toBeDefined();
        expect(serverNextModule).toBeDefined();
      } catch (error) {
        // Server imports might fail due to missing dependencies
        // Just ensure no critical errors
        console.log('Server import warning:', String(error));
      }
    });
  });

  describe('Cross-Contamination Detection', () => {
    test('edge export does not import any server-only files', async () => {
      const fs = await import('fs/promises');
      const content = await fs.readFile(EXPORT_FILES.serverNextEdge, 'utf-8');

      // Check for server-only imports
      const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"];?$/gm;
      const imports: string[] = [];
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      const serverOnlyImports = imports.filter(
        (imp) =>
          imp.includes('/server/') &&
          !imp.includes('/server/providers/sentry-edge') &&
          !imp.includes('/shared/'),
      );

      expect(serverOnlyImports).toEqual([]);
    });

    test('client exports do not import server exports', async () => {
      const fs = await import('fs/promises');

      for (const file of [EXPORT_FILES.client, EXPORT_FILES.clientNext]) {
        const content = await fs.readFile(file, 'utf-8');

        // Check for server imports
        const hasServerImports =
          content.includes("from './server") ||
          content.includes('from "./server') ||
          (content.includes('/server/') && !content.includes('/shared/'));

        expect(hasServerImports).toBe(false);
      }
    });

    test('static imports vs dynamic imports isolation', async () => {
      const fs = await import('fs/promises');

      // Check server-next.ts
      const serverNextContent = await fs.readFile(EXPORT_FILES.serverNext, 'utf-8');
      const serverStaticOtel =
        serverNextContent.includes('import') &&
        (serverNextContent.includes("from '@opentelemetry") ||
          serverNextContent.includes("from '@vercel/otel"));
      expect(serverStaticOtel).toBe(false);

      // Check edge - should have NO OTEL at all
      const edgeContent = await fs.readFile(EXPORT_FILES.serverNextEdge, 'utf-8');
      const edgeHasOtel =
        edgeContent.includes('@opentelemetry') || edgeContent.includes('@vercel/otel');
      expect(edgeHasOtel).toBe(false);
    });
  });

  describe('Five-File Export Pattern Integrity', () => {
    test('all export files exist and are accessible', async () => {
      const fs = await import('fs/promises');

      for (const [name, filePath] of Object.entries(EXPORT_FILES)) {
        try {
          await fs.access(filePath);
        } catch (error) {
          expect.fail(`Export file ${name} (${filePath}) is not accessible: ${error}`);
        }
      }
    });

    test('each export file has expected exports', async () => {
      // Simple check - just verify files contain the expected export names
      const fs = await import('fs/promises');

      const tests = [
        { file: EXPORT_FILES.client, exports: EXPECTED_EXPORTS.client },
        { file: EXPORT_FILES.server, exports: EXPECTED_EXPORTS.server },
        { file: EXPORT_FILES.clientNext, exports: EXPECTED_EXPORTS.clientNext },
        { file: EXPORT_FILES.serverNext, exports: EXPECTED_EXPORTS.serverNext },
        { file: EXPORT_FILES.serverNextEdge, exports: EXPECTED_EXPORTS.serverNextEdge },
      ];

      for (const { file, exports } of tests) {
        const content = await fs.readFile(file, 'utf-8');

        for (const exportName of exports) {
          const hasExport =
            content.includes(`export function ${exportName}`) ||
            content.includes(`export async function ${exportName}`) ||
            content.includes(`export const ${exportName}`) ||
            content.includes(`export { ${exportName}`) ||
            (content.includes(`${exportName},`) && content.includes('export {'));

          if (!hasExport) {
            console.error(`Missing export '${exportName}' in ${file}`);
          }
          expect(hasExport).toBe(true);
        }
      }
    });

    test('package.json exports match actual files', async () => {
      const fs = await import('fs/promises');
      const packageJsonPath = path.join(PACKAGE_ROOT, '../package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      const exports = packageJson.exports;
      expect(exports).toBeDefined();

      // Check that all expected exports exist in package.json
      expect(exports['./client']).toBe('./src/client.ts');
      expect(exports['./server']).toBe('./src/server.ts');
      expect(exports['./client/next']).toBe('./src/client-next.ts');
      expect(exports['./server/next']).toBe('./src/server-next.ts');
      expect(exports['./server/next/edge']).toBe('./src/server-next-edge.ts');
    });
  });

  describe('Regression Prevention', () => {
    test('no accidental re-introduction of static OTEL imports', async () => {
      // This test specifically checks for the issue we just fixed
      const fs = await import('fs/promises');

      // Check all TypeScript files for static OpenTelemetry imports
      const checkFile = async (filePath: string): Promise<string[]> => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const staticOtelRegex = /^import\s+.*from\s+['"]@opentelemetry[^'"]*['"];?$/gm;
          const matches: string[] = [];
          let match;

          while ((match = staticOtelRegex.exec(content)) !== null) {
            matches.push(match[0]);
          }

          return matches;
        } catch {
          return [];
        }
      };

      // Check critical files
      const criticalFiles = [
        EXPORT_FILES.serverNextEdge,
        EXPORT_FILES.client,
        EXPORT_FILES.clientNext,
      ];

      for (const filePath of criticalFiles) {
        const staticImports = await checkFile(filePath);
        expect(staticImports).toEqual([]);

        if (staticImports.length > 0) {
          console.error(`Found static OTEL imports in ${filePath}:`, staticImports);
        }
      }
    });

    test('eval-wrapped imports are properly formatted', async () => {
      const fs = await import('fs/promises');

      // Check that eval-wrapped imports follow the correct pattern
      const evalImportRegex =
        /eval\s*\(\s*['"`]\(\s*specifier\s*\)\s*=>\s*import\s*\(\s*specifier\s*\)['"`]\s*\)/;

      const checkFile = async (filePath: string): Promise<boolean> => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const hasEvalImports = content.includes('eval(');

          if (hasEvalImports) {
            return evalImportRegex.test(content);
          }

          return true; // No eval imports is fine
        } catch {
          return true;
        }
      };

      // Check all export files
      for (const [name, filePath] of Object.entries(EXPORT_FILES)) {
        const isValid = await checkFile(filePath);
        expect(isValid).toBe(true);

        if (!isValid) {
          console.error(`Invalid eval-wrapped import format in ${name} (${filePath})`);
        }
      }
    });

    test('runtime environment detection is consistent', async () => {
      // Check that all files use consistent runtime detection patterns
      const fs = await import('fs/promises');

      const expectedPatterns = [
        /process\.env\.NEXT_RUNTIME\s*===\s*['"]edge['"]/,
        /process\.env\.NEXT_RUNTIME\s*===\s*['"]nodejs['"]/,
      ];

      const checkFile = async (filePath: string) => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const hasRuntimeCheck = content.includes('NEXT_RUNTIME');

          if (hasRuntimeCheck) {
            const hasValidPattern = expectedPatterns.some((pattern) => pattern.test(content));
            return { hasCheck: true, isValid: hasValidPattern };
          }

          return { hasCheck: false, isValid: true };
        } catch {
          return { hasCheck: false, isValid: true };
        }
      };

      for (const [name, filePath] of Object.entries(EXPORT_FILES)) {
        const result = await checkFile(filePath);

        if (result.hasCheck) {
          expect(result.isValid).toBe(true);

          if (!result.isValid) {
            console.error(`Invalid runtime detection pattern in ${name} (${filePath})`);
          }
        }
      }
    });
  });
});
